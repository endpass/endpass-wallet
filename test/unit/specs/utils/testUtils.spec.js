import * as testUtils from '@/utils/testUtils';

describe('generateStubs', () => {
  const component1 = {
    name: 'component-1'
  };
  const component2 = {
    name: 'component-2'
  };
  const parentComponent = {
    components: {
      [component1.name]: component1,
      [component2.name]: component2
    }
  };
  const stubs = testUtils.generateStubs(parentComponent);

  it('should return stub components', () => {
    const expected = {
      [component1.name]: { render: () => {} },
      [component2.name]: { render: () => {} }
    };

    expect(JSON.stringify(stubs)).toEqual(JSON.stringify(expected));
  });

  it('should correct render stub component', () => {
    const createElement = jest.fn();
    const context = {
      $slots: {
        default: {}
      }
    };

    stubs[component1.name].render.call(context, createElement);

    expect(createElement).toHaveBeenCalledTimes(1);
    expect(createElement).toHaveBeenCalledWith(component1.name, context.$slots.default);
  });
});
