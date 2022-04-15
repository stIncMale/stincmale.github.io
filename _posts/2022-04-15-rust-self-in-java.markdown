---
layout: post
slug: rust-self-in-java
title: Simulating Rust's <code>Self</code> keyword via generics in Java
categories: [tech]
tags: [Java, Rust]
date: 2022-04-15T10:40:00Z
custom_update_date: 2022-04-15T10:40:00Z
custom_keywords: [Rust, Java, Self]
custom_description: Rust allows referring to an unknown type in some contexts, e.g., referring to the implementing type within a trait, by using the "Self" keyword. While there is no counterpart of this keyword in Java, we can simulate it via generic classes.
---
{% include common-links-abbreviations.markdown %}

[`Self`]: <https://doc.rust-lang.org/std/keyword.SelfTy.html>

[Rust] allows referring to an unknown type in some contexts,
e.g., referring to the implementing type within a trait,
by using the [`Self`] keyword.
While there is no counterpart of this keyword in [Java], we can simulate it via
[generic classes](https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.1.2).

{% include toc.markdown %}

## [](#self-rust){:.section-link}[`Self`] and why Java gets by without it {#self-rust}

Let us see what `Self` in Rust is by drawing a parallel between Rust and Java:
standard libraries of both languages contain API for cloning a value,
and comparing the APIs will help us to demonstrate `Self`.

The method
[`std::clone::Clone.clone`](https://doc.rust-lang.org/std/clone/trait.Clone.html#tymethod.clone)
from the Rust Standard Library creates and returns a copy of the value,
where the meaning of the word "copy" is left up to the implementation of the
[`Clone`](https://doc.rust-lang.org/std/clone/trait.Clone.html) trait.[^1]
The `Clone.clone` method returns `Self`, which is a keyword
that allows referring to the actual type, which implements the trait.
The `Self` keyword seems to be necessary in Rust because of the following:

1. there is no type that is a supertype for all other types;
2. multiple types may implement `Clone`, and due to the previos point,
they cannot be represented by a single type; 
3. the author of the trait does not know all the types that will implement the trait,
   so specifying a union of multiple known types is not possible even in principle. 

The counterpart of this method in the Java SE API is
[`java.lang.Object.clone`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#clone()).[^2]
It creates and returns a copy of the object.
The specification proposes a convention according to which "copy" has deep copying semantics,
but implementations are allowed to have shallow or deep semantics, or anything in between.[^3]
`Object.clone` returns
[`Object`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html),
because all Java
[reference types](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.3)
are subtypes of `Object`. Further,
[return-type-substitutability](https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.4.5)
allows subclasses
[overriding](https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.4.8.1)
this method to return the
[type they introduce](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.12.6)
instead of returning `Object`, like in the following
[example](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/self/CloneableExample.java):

```java
// note that the return type is `CloneableExample`, not `Object`
public CloneableExample clone() {
    try {
        return (CloneableExample) super.clone();
    } catch (CloneNotSupportedException e) {
        throw new AssertionError("Unreachable");
    }
}
```

Thus, we can get by without having `Self` in Java as long as we can override a method
to return the correct type. It is also clear now in what situations having the keyword
would be beneficial: when a method defined in a
[superclass](https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.1.4)
needs to return a reference value of the
[run-time class](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#getClass())
of the object on which it is called,
and we either cannot or do not want to override this method.

## [](#self-java){:.section-link}Simulating [`Self`] in Java {#self-java}

The specification of `Object.clone` states that by convention
<q>"returned object should be obtained by calling `super.clone`.
If a class and all of its superclasses (except `Object`) obey this convention,
it will be the case that `x.clone().getClass() == x.getClass()`"</q>.
Interestingly, simulating `Self` allows us to overcome this requirement by calling `super.clone`
only in a superclass, without bothering subclasses with overriding the `clone` method.

Since Java does not have the `Self` keyword,
the only way for us to specify `Self` as the return type of the `clone` method in the superclass
is to make the superclass generic and introduce `Self` as a
[type parameter](https://docs.oracle.com/javase/specs/jls/se17/html/jls-8.html#jls-8.1.2)
of the class: `Copy<Self>`{:.highlight .language-java}.
We further need each subclass to specify the type it introduces as the `Self`
[type argument](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.5.1),
and we may guide subclasses by setting an upper bound of `Self` to be the supertype
introduced by the superclass:
`Copy<Self extends Copy<Self>>`{:.highlight .language-java}. Our
[`Copy`](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/self/Copy.java)
may now override `Object.clone` as follows:

```java
/**
 * Instances of subclasses of this class can be shallowly copied via {@link #clone()} without
 * the need to override the method.
 *
 * @param <Self> A type introduced by the concrete subclass of this class.
 */
abstract class Copy<Self extends Copy<Self>> implements Cloneable {
  protected Copy() {
  }

  @Override
  @SuppressWarnings("unchecked")
  public final Self clone() {
    try {
      return (Self) super.clone();
    } catch (CloneNotSupportedException e) {
      throw new AssertionError("Unreachable");
    }
  }
}
```

Extending this class has an effect similar to that of Rust's
[`#[derive(Copy, Clone)]`](https://doc.rust-lang.org/std/marker/trait.Copy.html#how-can-i-implement-copy)[^1]
attribute which allows [generating](https://doc.rust-lang.org/reference/attributes/derive.html)
code that copies values:

```java
class AutoCloneableExample extends Copy<AutoCloneableExample> {
    final List<String> value;

    AutoCloneableExample(List<String> value) {
        this.value = value;
    }
}
```

```java
@Test
void copy() {
    AutoCloneableExample original = new AutoCloneableExample(List.of("a", "b"));
    AutoCloneableExample copy = original.clone();
    assertNotSame(original, copy);
    assertSame(original.getClass(), copy.getClass());
    assertSame(original.value, copy.value);
}
```

The full code and tests can be found
[here](https://github.com/stIncMale/sandbox-java/tree/master/examples/src/main/java/stincmale/sandbox/examples/self)
and
[here](https://github.com/stIncMale/sandbox-java/tree/master/examples/src/test/java/stincmale/sandbox/examples/self)
respectively.
I am
[planning](https://github.com/mongodb/mongo-java-driver/pull/891/files#diff-169ed033153b41d22b7c6c2741c535a7c66d27cf7930e1a4c260284598236f7e)
to
[use the discussed approach for emulating `Self`](https://github.com/mongodb/mongo-java-driver/blob/062994027a96660223199924ee92b526639424df/driver-core/src/main/com/mongodb/internal/client/model/AbstractConstructibleBson.java#L61-L69)
in production code in a situation resembling the one we have considered above.

## [](#shattered-hopes){:.section-link}Shattered hopes {#shattered-hopes}

Java supports multiple inheritance only from interfaces, and that is good.
However, it means that the `Copy` class we introduced above prevents subclasses
from extending any other classes.
I hoped that this limitation can be overcome by refactoring `Copy` into an interafce
with `Copy.clone` being a
[default method](https://docs.oracle.com/javase/specs/jls/se17/html/jls-9.html#jls-9.4.3):

```java
interface Copy<Self extends Copy<Self>> extends Cloneable {
  @SuppressWarnings("unchecked")
  default Self clone() {
    try {
      return (Self) Cloneable.super.clone();
    } catch (CloneNotSupportedException e) {
      throw new AssertionError("Unreachable");
    }
  }
}
```

Sadly, compilation of this code fails with

```
cannot find symbol
symbol: method clone()
```

That is because `java.lang.Object.clone` is declared as
[`protected`](https://docs.oracle.com/javase/specs/jls/se17/html/jls-6.html#jls-6.6.1),
and `Copy` is neither a subclass of `Object`, nor is contained in the `java.lang` package.
However, even if `Object.clone` were declared `public`,
the `Copy` interface would not be allowed to override this method because
[default methods are not allowed to override `Object`'s methods](https://mail.openjdk.java.net/pipermail/lambda-dev/2013-March/008435.html).
This limitation causes compilation of the following code

```java
interface Copy<Self extends Copy<Self>> extends Cloneable {
    @Override
    default String toString() {
        return Cloneable.super.toString();
    }
}
```

to fail with

```
default method toString in interface Copy overrides a member of java.lang.Object
```

If the idea had worked out, it would have brought meaning to the existence of the `Object.clone` method.

[^1]: The [`std::marker::Copy`](https://doc.rust-lang.org/std/marker/trait.Copy.html) trait
    defines shallow copying semantics by specifying that values are
    <q>"duplicated simply by copying bits"</q>.
    It also restricts `Self` to types that implement
    [`std::clone::Clone`](https://doc.rust-lang.org/std/clone/trait.Clone.html)
    by being defined as `trait Copy: Clone`{:.highlight .language-rust},
    which is a short version of `trait Copy where Self: Clone`{:.highlight .language-rust},
    and is the closest thing Rust has to Java's
    [inheritance of interfaces](https://docs.oracle.com/javase/specs/jls/se17/html/jls-9.html#jls-9.4.1).

[^2]: I avoid implementing `Object.clone`, and prefer using
    [copy sonstructors](https://www.baeldung.com/java-copy-constructor) instead.
    In my opinion, `Object.clone` pollutes the API of the `Object` class for no good reason.
    Nevertheless, I use it here because cloning is a convenient similarity between
    the Java and Rust standard libraries.

[^3]: The implementation of the `Object.clone` method in the `Object` class
    <q>["performs a "shallow copy" of this object, not a "deep copy" operation"](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#clone())</q>.
    However, the convention proposed by the specification also states that
    <q>"the object returned by this method should be independent of
    this object (which is being cloned) … Typically, this means copying
    any mutable objects that comprise the internal "deep structure" of the object being cloned"</q>.
