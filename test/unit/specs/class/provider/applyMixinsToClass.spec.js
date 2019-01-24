import applyMixinsToClass from '@/class/provider/applyMixinsToClass';

describe('applyMixinsToClass', () => {
  class A {}
  A.prototype.methodA = jest.fn();

  const methodB = jest.fn();
  const methodC = jest.fn();
  const mixinB = Parent => {
    class B extends Parent {}
    B.prototype.methodB = methodB;
    B.prototype.methodC = methodC;
    return B;
  };

  const mixinC = Parent => {
    class C extends Parent {}
    C.prototype.methodC = jest.fn();
    return C;
  };

  const D = applyMixinsToClass(A, [mixinB, mixinC]);

  it('should return class with mixin prototype', () => {
    expect(new D() instanceof A).toBeTruthy();
  });

  it('should call prototype method', () => {
    const d = new D();

    d.methodA();
    d.methodB();

    expect(A.prototype.methodA).toBeCalled();
    expect(methodB).toBeCalled();
  });

  it('should not call prototype method', () => {
    new D().methodC();
    expect(methodC).not.toBeCalled();
  });
});
