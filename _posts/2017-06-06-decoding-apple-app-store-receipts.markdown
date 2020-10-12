---
layout: post
slug: decoding-apple-app-store-receipts
title: Decoding Apple App Store receipts (PKCS &num;7, ASN.1) in Java
categories: [tech]
tags: [Java]
date: 2017-06-06T12:00:00Z
custom_update_date: 2020-10-12T05:37:00Z
custom_keywords: [Apple App Store, receipt, in-app purchase, subscription, decode, PKCS &num;7, ASN.1]
custom_description: It appears Apple thinks that no one needs to decode receipts on the server side. In practice, however, things are not necessary as smooth and we had to decode receipts before validating them in order to handle and restore subscriptions. This post describes how to do this in Java.
---
{% include common-links-abbreviations.markdown %}

According to the [documentation](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateLocally.html),
App Store receipts are binary files packed in a
<q>"[PKCS #7](https://www.rfc-editor.org/rfc/rfc2315) container,
as defined by [RFC 2315](https://www.rfc-editor.org/rfc/rfc2315),
with its payload encoded using [ASN.1 (Abstract Syntax Notation One)](http://www.itu.int/en/ITU-T/asn1/Pages/introduction.aspx),
as defined by [ITU-T X.690](http://handle.itu.int/11.1002/1000/12483)[^1]"</q>
The structure of a receipt is shown in the image below.

<figure>
  <img src="{% link /assets/img/blog/decoding-apple-app-store-receipts/receipt-structure.png %}" alt="Structure of a receipt" style="width: 30em; height: auto;">
  <figcaption>Structure of a receipt</figcaption>
</figure>

The [documentation](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateLocally.html)
describes how to decode a receipt in C/C++, but what if you need to do this in Java?
Apparently, the authors think that no one needs to decode receipts in Java because if it is Java,
then we are talking about the server side, and in this case, one can obtain a JSON-encoded receipt data from the
[App Store validation service](https://developer.apple.com/documentation/storekit/in-app_purchase/validating_receipts_with_the_app_store).
In practice, however, things are not necessary as smooth and we had to decode receipts before validating them in order to handle and restore subscriptions.
This post describes how I decoded receipts in [King of Thieves](http://www.kingofthieves.com/) at [ZeptoLab](https://www.zeptolab.com/).

## [](#generate-classes){:.section-link}Generating Java classes from the ASN.1 module {#generate-classes}
If you are familiar with [Protocol Buffers](https://developers.google.com/protocol-buffers/), you will easily understand this step.
The [documentation](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateLocally.html)
specifies the following ASN.1 definition of a payload:

```
-- this definition was taken from https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateLocally.html
-- app-store-receipt.asn
ReceiptModule DEFINITIONS ::=
BEGIN

ReceiptAttribute ::= SEQUENCE {
    type    INTEGER,
    version INTEGER,
    value   OCTET STRING
}

Payload ::= SET OF ReceiptAttribute

InAppAttribute ::= SEQUENCE {
    type                   INTEGER,
    version                INTEGER,
    value                  OCTET STRING
}

InAppReceipt ::= SET OF InAppAttribute

END
```

This definition describes the structure of a payload in a way similar to [Protocol Buffers `.proto` files](https://developers.google.com/protocol-buffers/docs/proto3).
Now we will use the compiler from the [ASN1bean](https://www.beanit.com/asn1/) library to generate Java classes
that are able to read data structured according to the above definition:

```shell
$ asn1bean-compiler -f app-store-receipt.asn -p stincmale.sandbox.examples.decodeappleappstorereceipt.asn1
```

The command above generates the following Java classes in the package
[<code>stincmale<wbr>.sandbox<wbr>.examples<wbr>.decodeappleappstorereceipt<wbr>.asn1<wbr>.receiptmodule</code>](https://github.com/stIncMale/sandbox/tree/master/examples/src/main/java/stincmale/sandbox/examples/decodeappleappstorereceipt/asn1/receiptmodule):
* `Payload` consists of `ReceiptAttribute`s, which are designated as attributes inside a payload in the image above.
* `ReceiptAttribute` is designated as an attribute inside a payload in the image above.
* `InAppReceipt` is the value of a `ReceiptAttribute`, which is designated as an in-app purchase receipt in the image above.
This value consists of `InAppAttribute`s, which are designated as attributes inside an in-app purchase receipt in the image above.
* `InAppAttribute` is designated as an attribute inside an in-app purchase receipt in the image above.

These classes require the [`com.beanit:asn1bean`](https://search.maven.org/artifact/com.beanit/asn1bean) library,
so make sure to include it in your project.

## [](#extract-payload){:.section-link}Extracting the receipt payload {#extract-payload}
Now we have classes that can decode a payload, but before doing that we need to extract it from a receipt.
I use the [Bouncy Castle](https://www.bouncycastle.org/java.html)
[org.bouncycastle:bcpkix-jdk15on](https://search.maven.org/artifact/org.bouncycastle/bcpkix-jdk15on) library for this purpose.
Before using it, we must make sure
[`BouncyCastleProvider`](https://www.bouncycastle.org/docs/docs1.5on/org/bouncycastle/jce/provider/BouncyCastleProvider.html) is added to the system:

```java
static {
  Security.addProvider(new BouncyCastleProvider());
}
```

With Bouncy Castle and the previously generated `Payload` class extracting and decoding a payload can be done the following way
(see [`AppStoreReceiptUtil.decodeReceipt(byte[] receipt)`](https://github.com/stIncMale/sandbox/blob/master/examples/src/main/java/stincmale/sandbox/examples/decodeappleappstorereceipt/AppStoreReceiptUtil.java)):

```java
Payload decodeReceipt(byte[] receipt) {
  Payload payload;
  try {
    CMSSignedData signedData = new CMSSignedData(receipt);
    CMSTypedData signedContent = signedData.getSignedContent();
    ByteArrayOutputStream signedDataStream = new ByteArrayOutputStream();
    signedContent.write(signedDataStream);
    byte[] signedDataBytes = signedDataStream.toByteArray();
    payload = new Payload();
    payload.decode(new ByteArrayInputStream(signedDataBytes));
  } catch (CMSException | IOException e) {
    throw new RuntimeException(e);
  }
  return payload;
}
```

That is it. Now we have our `Payload` and can read everything there is in it.
The class [`AppStoreReceiptUtil`](https://github.com/stIncMale/sandbox/blob/master/examples/src/main/java/stincmale/sandbox/examples/decodeappleappstorereceipt/AppStoreReceiptUtil.java)
has some useful methods, e.g., the `toString(Payload payload, boolean omitUnsupportedAttributes)` method
that allows converting a `Payload` in a human-readable formatted text. See
[`AppStoreReceiptDecoderExample`](https://github.com/stIncMale/sandbox/blob/master/examples/src/main/java/stincmale/sandbox/examples/decodeappleappstorereceipt/AppStoreReceiptDecoderExample.java)
for an example.

[^1]: ITU stands for the International Telecommunication Union, ITU-T stands for the ITU Telecommunication Standardization Sector.
