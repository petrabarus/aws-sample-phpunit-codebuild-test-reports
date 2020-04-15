<?php

use PHPUnit\Framework\TestCase;

class MyClassTest extends TestCase {

    public function testMethod1() {
        $object = new MyClass();
        $this->assertEquals(2, $object->method1(1, 1));
        $this->assertEquals(3, $object->method1(1, 2));
    }

    public function testMethod2() {
        $object = new MyClass();
        $this->assertEquals('11', $object->method2('1', '1'));
        $this->assertEquals('12', $object->method2('1', '2'));
    }
}
