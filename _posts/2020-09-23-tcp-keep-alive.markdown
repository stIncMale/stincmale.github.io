---
layout: post
slug: tcp-keep-alive
title: TCP keep-alive mechanism is not meant to keep TCP connections alive
categories: [tech]
tags: [TCP, networking]
date: 2020-09-25T12:00:00Z
custom_update_date: 2022-04-03T09:45:00Z
custom_keywords: [TCP, keep-alive, SO_KEEPALIVE, TCP_KEEPIDLE, KeepAliveTime, proxy]
custom_description: The name &quot;keep-alive&quot; is misleading and leads some engineers into thinking that it is a good idea to use the mechanism for preventing a TCP proxy from considering a connection idle and terminating it. This article explains why even if possible, this cannot be done reliably. It also shows an example of using HAProxy where the approach fails.
---
{% include common-links-abbreviations.markdown %}

[`TIME-WAIT`]: <https://www.rfc-editor.org/rfc/rfc793#section-3.2>

*[NAT]:
{:data-title="Network Address Translator"}

The name "keep-alive" is misleading and leads some engineers into thinking that it is a good idea to use the mechanism
for preventing a TCP proxy from considering a connection[^1] idle and terminating it.
This article explains why even if possible (and that is a big "if"), this cannot be done reliably.
It also shows an example of using HAProxy where the approach fails.

{% include toc.markdown %}

## [](#environment){:.section-link}Environment {#environment}
The information specified in this article was verified in the following environment

| Software | Version |
|-|-|
| [Ubuntu] on [WSL 2] | 20.04 |
| [Windows] | 10 Home, version 21H1 |
| [OpenJDK JDK] | 17 |
| [HAProxy](https://www.haproxy.org) | 2.0.13 |

## [](#theory){:.section-link}Theory {#theory}
The TCP keep-alive mechanism is specified in [RFC 1122. 4.2.3.6 TCP Keep-Alives](https://www.rfc-editor.org/rfc/rfc1122#page-101)[^2].
Below are some notable points from the specification.

1. The intent behind the keep-alive mechanism is to <q>"**confirm that an idle connection is still active**"</q>,
   not to keep a connection alive by producing traffic even when an application does not produce any. The specification further clarifies:
   
   > "TCP keep-alive mechanism should only be invoked in server applications that might otherwise hang indefinitely and consume resources unnecessarily if a
   > client crashes or aborts a connection during a network failure."
   
   In other words, the **keep-alive mechanism is meant to detect whether a connection is worth closing** and releasing the occupied resources,
   as it is unlikely that the peer is still out there intending to communicate.
2. > "Implementors **MAY include** "keep-alives" in their TCP implementations …"
   
   This means that the mechanism **may not even be implemented**.
3. > "Keep-alive packets MUST only be sent when no data or acknowledgement packets have been received for the connection within an interval.
   > This interval MUST be configurable and MUST **default to no less than two hours**."
   
   The interval mentioned here is called
   [`TCP_KEEPIDLE` in Linux](https://man7.org/linux/man-pages/man7/tcp.7.html),
   [`TCP_KEEPIDLE` in Windows](https://docs.microsoft.com/en-us/windows/win32/winsock/ipproto-tcp-socket-options),
   [`TCP_KEEPIDLE` in OpenJDK JDK / Oracle JDK, etc.](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.net/jdk/net/ExtendedSocketOptions.html#TCP_KEEPIDLE)[^3],
   and we most likely would want to adjust the default value. Unfortunately,
   [OpenJDK JDK] does not support the [`TCP_KEEPIDLE`](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.net/jdk/net/ExtendedSocketOptions.html#TCP_KEEPIDLE) option on Windows
   (at least at the time of writing this article).
   Following is the output of
   [`ServerSocket.accept().supportedOptions()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/net/Socket.html#supportedOptions()){:.highlight .language-java}
   * Windows: `SO_LINGER, TCP_NODELAY, SO_SNDBUF, SO_RCVBUF, SO_KEEPALIVE, SO_REUSEADDR, IP_TOS`;
   * Ubuntu: `IP_TOS, SO_INCOMING_NAPI_ID, SO_RCVBUF, SO_REUSEADDR, SO_REUSEPORT, TCP_KEEPIDLE,
   TCP_KEEPINTERVAL, TCP_NODELAY, SO_KEEPALIVE, TCP_QUICKACK, SO_SNDBUF, SO_LINGER, TCP_KEEPCOUNT`.
   
   This leaves us with **adjusting the keep-alive idle interval globally in Windows**
   (as opposed to adjusting it on a per-socket basis programmatically)
   via the [`KeepAliveTime`](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc782936(v=ws.10)) registry entry
   (the [`SO_KEEPALIVE` socket option](https://docs.microsoft.com/en-us/windows/win32/winsock/so-keepalive) mentions also
   [`KeepAliveInterval`](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc758083(v=ws.10))
   and [`TcpMaxDataRetransmissions`](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc780586(v=ws.10))
   registry entries).
   Adjusting this registry entry requires restarting the operating system.

Taking all the aforementioned into account, it is safe to say that using the TCP keep-alive mechanism with an intent to keep connections active
is an abuse of an optional mechanism, which may not be always easily configurable.
TCP proxies do not have to behave in a way we may expect when trying to prevent connections from idling via the keep-alive mechanism.[^4]

### [](#right-way){:.section-link}How to actually keep connection alive {#right-way}
Sure, one may imagine a TCP proxy interpreting keep-alive probes as activity in a connection, but the important thing here is that
this would have been just an implementation quirk of the proxy. On the other hand, if two peers implement ping/pong messages
on top of TCP[^5], then a TCP proxy has to treat such messages like any other TCP traffic,
thus considering a connection active regardless of the proxy implementation.

## [](#practice){:.section-link}Practice {#practice}
Let us try and see how a [production-grade](https://www.haproxy.org/they-use-it.html) HAProxy reacts to TCP keepalive probes
when operating as a TCP reverse proxy. I am going to use a self-written TCP
[client](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/tcpkeepalive/Client.java)
and [server](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/tcpkeepalive/Server.java)
that communicate via a protocol mostly compliant with the [echo protocol](https://www.rfc-editor.org/rfc/rfc862)[^6].

### [](#preparation){:.section-link}Preparation {#preparation}
I am going to run the proxy, the client and the server on Ubuntu.

#### [](#prepare-haproxy){:.section-link}Prepare HAProxy {#prepare-haproxy}
##### [](#install-haproxy){:.section-link}Install {#install-haproxy}
```shell
$ sudo apt-get update
...
$ sudo apt-get install haproxy --yes
...
```

##### [](#set-up-haproxy){:.section-link}Set up {#set-up-haproxy}
The initial content of `/etc/haproxy/haproxy.cfg`:

```
global
        log /dev/log    local0
        log /dev/log    local1 notice
        chroot /var/lib/haproxy
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

        # Default SSL material locations
        ca-base /etc/ssl/certs
        crt-base /etc/ssl/private

        # See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
        log     global
        mode    http
        option  httplog
        option  dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
        errorfile 400 /etc/haproxy/errors/400.http
        errorfile 403 /etc/haproxy/errors/403.http
        errorfile 408 /etc/haproxy/errors/408.http
        errorfile 500 /etc/haproxy/errors/500.http
        errorfile 502 /etc/haproxy/errors/502.http
        errorfile 503 /etc/haproxy/errors/503.http
        errorfile 504 /etc/haproxy/errors/504.http
```

We need to add the following at the end of the configuration file:

```
frontend fe
  bind localhost:30000 #Client connects to this socket
  mode tcp
  timeout client 600000ms #The inactivity timeout applies when the client is expected to acknowledge or send data.
                          #  See https://cbonte.github.io/haproxy-dconv/2.0/configuration.html#4-timeout%20client
  default_backend be

backend be
  mode tcp
  timeout connect 1000ms #The maximum time to wait for a connection attempt to a server to succeed.
                         #  See https://cbonte.github.io/haproxy-dconv/2.0/configuration.html#4-timeout%20connect
  timeout server 15000ms #The inactivity timeout applies when the server is expected to acknowledge or send data.
                         #  See https://cbonte.github.io/haproxy-dconv/2.0/configuration.html#4-timeout%20server
  server s1 localhost:30001 #Server listens on this socket
```

With this configuration, the proxy listens for TCP connections from clients on the port 30000
and establishes respective TCP connections with the server on the port 30001.
Note that the [`timeout client`](https://cbonte.github.io/haproxy-dconv/2.0/configuration.html#4-timeout%20client) is 6 minutes,
while the [`timeout server`](https://cbonte.github.io/haproxy-dconv/2.0/configuration.html#4-timeout%20server) is 15 seconds.
So in our case, if there is no client-server activity, then the proxy detects it based on the `timeout server` and terminates both connections
(the client-facing socket managed by the proxy stays in the [`TIME-WAIT`] state in this case).

Now we should restart the proxy to apply the configuration changes:

```shell
$ sudo service haproxy restart
 * Restarting haproxy haproxy
[WARNING] 267/203941 (16712) : parsing [/etc/haproxy/haproxy.cfg:23] : 'option httplog' not usable with frontend 'fe' (needs 'mode http'). Falling back to 'option tcplog'.
[WARNING] 267/203941 (16713) : parsing [/etc/haproxy/haproxy.cfg:23] : 'option httplog' not usable with frontend 'fe' (needs 'mode http'). Falling back to 'option tcplog'.
[ALERT] 267/203941 (16713) : sendmsg()/writev() failed in logger #1: No such file or directory (errno=2)
                                                                                                                                                                    [ OK ]
```

The warnings/alerts you see are there because the default logging configuration is not compatible with the changes made and with my environment,
but logging is irrelevant for our purposes. Let us ignore them and check whether HAProxy is listening for client connections:

```shell
$ sudo netstat -antp | grep -E "^Proto|30000"
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.1:30000         0.0.0.0:*               LISTEN      16714/haproxy
```

#### [](#prepare-client-server){:.section-link}Prepare the client and the server {#prepare-client-server}
##### [](#download-build-client-server){:.section-link}Download and build from sources {#download-build-client-server}
```shell
$ git clone https://github.com/stIncMale/sandbox-java.git
...
$ cd sandbox
$ mvn clean verify -f examples/pom.xml
...
[INFO] BUILD SUCCESS
...
```

##### [](#start-build-client-server){:.section-link}Start {#start-client-server}
Start the server:

```shell
$ java -cp examples/target/classes/ stincmale.sandbox.examples.tcpkeepalive.Server localhost 30001
2020-09-25T07:29:57.733678600Z main      Starting listening on localhost/127.0.0.1:30001
2020-09-25T07:29:57.750713Z    main      Accepting connections on ServerSocket[addr=localhost/127.0.0.1,localport=30001]
```

Start the client:

```shell
$ java -cp examples/target/classes/ stincmale.sandbox.examples.tcpkeepalive.Client localhost 30000
2020-09-25T07:30:10.434081900Z main      Connecting to localhost/127.0.0.1:30000 with timeout 1000 ms
2020-09-25T07:30:10.447577700Z main      Connected via Socket[addr=localhost/127.0.0.1,port=30000,localport=34974]
2020-09-25T07:30:10.453081100Z main      Set read timeout 25000 ms for Socket[addr=localhost/127.0.0.1,port=30000,localport=34974]
Specify data to be sent:
```

As we can see, the client connected to the proxy on the port 30000, while the server was listening on the port 30001.

### [](#within-timeout){:.section-link}Experiment with inactivity within the `timeout server` {#within-timeout}
In this experiment, we will try to sustain a client-server dialogue for longer than
the `timeout server`, which is 15 s,
by regularly sending data between the client and the server.
The log below is combined from both client and server logs for convenience:

```
2021-10-10T02:37:39.729764800Z main      Server  Starting listening on localhost/127.0.0.1:30001
2021-10-10T02:37:39.738215700Z main      Server  Accepting connections on ServerSocket[addr=localhost/127.0.0.1,localport=30001]
2021-10-10T02:37:44.281901700Z main      Client  Connecting to localhost/127.0.0.1:30000 with timeout 1000 ms
2021-10-10T02:37:44.288878400Z main      Server  Accepted a new connection Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:37:44.289386100Z main      Client  Connected via Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:37:44.296470500Z main      Client  Set read timeout 25000 ms for Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:37:44.301891300Z main      Server  Set TCP_KEEPIDLE 5000 ms for Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:37:44.302720Z    main      Server  Set TCP_KEEPINTERVAL 5000 ms for Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:37:44.308110700Z main      Server  Set TCP_KEEPCOUNT 8 for Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:37:44.314504300Z server-0  Server  Set read timeout 25000 ms for Socket[addr=/127.0.0.1,port=34264,localport=30001]
                                         Client  Specify data to be sent:
                                         Client  h
2021-10-10T02:37:56.803724300Z input     Client  Sending 0x68 'LATIN SMALL LETTER H' via Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:37:56.816179600Z server-0  Server  Received 0x68 'LATIN SMALL LETTER H' via Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:37:56.816564700Z server-0  Server  Sending 0x68 'LATIN SMALL LETTER H' via Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:37:56.817674800Z main      Client  Received 0x68 'LATIN SMALL LETTER H' via Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
                                         Client  Specify data to be sent:
                                         Client  b
2021-10-10T02:38:08.717390400Z input     Client  Sending 0x62 'LATIN SMALL LETTER B' via Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:38:08.718192400Z server-0  Server  Received 0x62 'LATIN SMALL LETTER B' via Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:38:08.718540400Z server-0  Server  Sending 0x62 'LATIN SMALL LETTER B' via Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:38:08.719041900Z main      Client  Received 0x62 'LATIN SMALL LETTER B' via Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:38:08.719642500Z main      Client  Gracefully closing Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:38:08.720591800Z main      Client  Disconnected Socket[addr=localhost/127.0.0.1,port=30000,localport=33226]
2021-10-10T02:38:08.722526500Z server-0  Server  The client Socket[addr=/127.0.0.1,port=34264,localport=30001] disconnected
2021-10-10T02:38:08.722840400Z server-0  Server  Gracefully closing Socket[addr=/127.0.0.1,port=34264,localport=30001]
2021-10-10T02:38:08.723302500Z server-0  Server  Disconnected Socket[addr=/127.0.0.1,port=34264,localport=30001]
```

The client connected at 02:37:44 and received the last byte at 02:38:08,
which means that the dialogue lasted for more than 15 s without being terminated by the proxy.
This is as expected because the client was regularly sending data to the server, and the server was regularly sending data back.

Note that the both the server and the client read timeout, which is 25 s,
are greater than the proxy `timeout server`, which is 15 s. Therefore, they cannot affect the next 
experiment, where we will not be sending data between the client and the server.
Note also that the server sends TCP keep-alive probes every 5 s after 5 s of idling.

### [](#exceeding-timeout){:.section-link}Experiment with inactivity exceeding the `timeout server` {#exceeding-timeout}
In this experiment we will try to sustain a client-server dialogue for longer than
the `timeout server`, which is 15 s,
despite not sending any data between the client and the server.
Let us see if the TCP keep-alive probes alone will prevent the proxy from terminating connections.
We will use [`tcpdump`](https://man7.org/linux/man-pages/man1/tcpdump.1.html) to see what is exactly going on
and confirm that the server actually sends TCP keep-alive probes:

```shell
$ sudo tcpdump -ttttt --number -nn -i lo port 30001
```

The log below is combined from both client and server logs for convenience:

```
2021-10-10T21:36:00.998541700Z main      Server  Starting listening on localhost/127.0.0.1:30001
2021-10-10T21:36:01.007406900Z main      Server  Accepting connections on ServerSocket[addr=localhost/127.0.0.1,localport=30001]
2021-10-10T21:36:01.548790600Z main      Client  Connecting to localhost/127.0.0.1:30000 with timeout 1000 ms
2021-10-10T21:36:01.555827Z    main      Client  Connected via Socket[addr=localhost/127.0.0.1,port=30000,localport=33274]
2021-10-10T21:36:01.555990Z    main      Server  Accepted a new connection Socket[addr=/127.0.0.1,port=34312,localport=30001]
2021-10-10T21:36:01.564353200Z main      Client  Set read timeout 25000 ms for Socket[addr=localhost/127.0.0.1,port=30000,localport=33274]
2021-10-10T21:36:01.569454600Z main      Server  Set TCP_KEEPIDLE 5000 ms for Socket[addr=/127.0.0.1,port=34312,localport=30001]
2021-10-10T21:36:01.570259100Z main      Server  Set TCP_KEEPINTERVAL 5000 ms for Socket[addr=/127.0.0.1,port=34312,localport=30001]
2021-10-10T21:36:01.576376800Z main      Server  Set TCP_KEEPCOUNT 8 for Socket[addr=/127.0.0.1,port=34312,localport=30001]
2021-10-10T21:36:01.583758100Z server-0  Server  Set read timeout 25000 ms for Socket[addr=/127.0.0.1,port=34312,localport=30001]
                                         Client  Specify data to be sent:
2021-10-10T21:36:16.558253900Z main      Client  The server Socket[addr=localhost/127.0.0.1,port=30000,localport=33274] disconnected
2021-10-10T21:36:16.558934Z    main      Client  Gracefully closing Socket[addr=localhost/127.0.0.1,port=30000,localport=33274]
2021-10-10T21:36:16.560088800Z main      Client  Disconnected Socket[addr=localhost/127.0.0.1,port=30000,localport=33274]
2021-10-10T21:36:16.562098900Z server-0  Server  The client Socket[addr=/127.0.0.1,port=34312,localport=30001] disconnected
2021-10-10T21:36:16.562558500Z server-0  Server  Gracefully closing Socket[addr=/127.0.0.1,port=34312,localport=30001]
2021-10-10T21:36:16.563216400Z server-0  Server  Disconnected Socket[addr=/127.0.0.1,port=34312,localport=30001]
```

The client connected at 21:24:56 and at 21:25:11 discovered that the server (actually, the proxy) disconnected,
which means that the dialogue lasted for about 15 s and then was terminated by the proxy.
Here is what the `tcpdump` tool captured:

```
1   00:00:00.000000 IP 127.0.0.1.34312 > 127.0.0.1.30001: Flags [S], seq 789648686, win 65495, options [mss 65495,sackOK,TS val 2360756096 ecr 0,nop,wscale 7], length 0
2   00:00:00.000006 IP 127.0.0.1.30001 > 127.0.0.1.34312: Flags [S.], seq 866552652, ack 789648687, win 65483, options [mss 65495,sackOK,TS val 2360756096 ecr 2360756096,nop,wscale 7], length 0
3   00:00:00.000011 IP 127.0.0.1.34312 > 127.0.0.1.30001: Flags [.], ack 1, win 512, options [nop,nop,TS val 2360756096 ecr 2360756096], length 0

4   00:00:05.016581 IP 127.0.0.1.30001 > 127.0.0.1.34312: Flags [.], ack 1, win 512, options [nop,nop,TS val 2360761113 ecr 2360756096], length 0
5   00:00:05.016588 IP 127.0.0.1.34312 > 127.0.0.1.30001: Flags [.], ack 1, win 512, options [nop,nop,TS val 2360761113 ecr 2360756096], length 0

6   00:00:10.056600 IP 127.0.0.1.30001 > 127.0.0.1.34312: Flags [.], ack 1, win 512, options [nop,nop,TS val 2360766153 ecr 2360761113], length 0
7   00:00:10.056611 IP 127.0.0.1.34312 > 127.0.0.1.30001: Flags [.], ack 1, win 512, options [nop,nop,TS val 2360766153 ecr 2360756096], length 0

8   00:00:15.004328 IP 127.0.0.1.34312 > 127.0.0.1.30001: Flags [F.], seq 1, ack 1, win 512, options [nop,nop,TS val 2360771100 ecr 2360756096], length 0
9   00:00:15.004358 IP 127.0.0.1.34312 > 127.0.0.1.30001: Flags [R.], seq 2, ack 1, win 512, options [nop,nop,TS val 2360771101 ecr 2360756096], length 0
```

* Segments 1-3 with flags `S` (`SYN`), `S.` (`SYN-ACK`), `.` (`ACK`) respectively
represent [three-way TCP handshake](https://www.rfc-editor.org/rfc/rfc793#section-3.4) between the proxy and the server.
The proxy initiated the handshake because the client connected to it;
the respective segments are not in the log because they involved the proxy frontend port 30000,
not the proxy backend port 30001, for which we were capturing segments.
* Segment 4 is a TCP keep-alive probe sent by the server to the proxy, segment 5 is a response to the probe sent by the proxy.
The same is true for segments 6 and 7 respectively. Note that the first probe was sent after
about 5 s of idling, the next probe was sent in another 5 s.
* Segments 8 and 9 with flags `F.` (`FYN-ACK`), `R.` (`RST-ACK`) respectively is how the proxy terminated its connection with the server.

Hereby we showed that TCP keep-alive mechanism cannot be used with HAProxy to prevent it from terminating connections.

[^1]: The "connection" referred to here is not a single
    [TCP connection](https://www.rfc-editor.org/rfc/rfc793#section-1.5),
    but an abstraction over two linked TCP connections&mdash;client-proxy & proxy-server, 
    that together allows client-server communication.

[^2]: I may also recommend reading
    ["When TCP sockets refuse to die"](https://idea.popcount.org/2019-09-20-when-tcp-sockets-refuse-to-die/)
    <span class="insignificant">by [Marek Majkowski](https://idea.popcount.org)</span>

[^3]: The link is to [Oracle JDK] documentation
    because there is no other documentation published for the option,
    but the option was [implemented](https://bugs.openjdk.java.net/browse/JDK-8194298) in [OpenJDK JDK].

[^4]: For software or hardware that operates on levels below TCP,
    e.g., [NAT](https://www.rfc-editor.org/rfc/rfc2663) implementations and firewalls operating on the IP level, the situation is different
    because TCP keep-alive probes are traffic for them just like any other traffic.

[^5]: For example, the [WebSocket](https://www.rfc-editor.org/rfc/rfc6455) protocol has
    [ping/pong frames](https://www.rfc-editor.org/rfc/rfc6455#section-5.5.2).

[^6]: The protocol is documented in
    [`Server.java`](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/tcpkeepalive/Server.java),
    and besides treating bytes
    `0x68` (`LATIN SMALL LETTER H` in [UTF-8](https://www.rfc-editor.org/rfc/rfc3629))
    and `0x62` (`LATIN SMALL LETTER B`) as `hello` and `bye` respectively, implements what I believe is the correct approach of gracefully terminating
    a TCP connection in a way that prevents accumulation of sockets in the [`TIME-WAIT`] state on the server side.
