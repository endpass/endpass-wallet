import * as testUtils from '@/utils/testUtils';

describe('generateStubs', () => {
  const component1 = {
    name: 'component-1',
  };
  const component2 = {
    name: 'component-2',
  };
  const parentComponent = {
    components: {
      [component1.name]: component1,
      [component2.name]: component2,
    },
  };
  const stubs = testUtils.generateStubs(parentComponent);

  it('should return stub components', () => {
    const expected = {
      [component1.name]: { render: () => {} },
      [component2.name]: { render: () => {} },
    };

    expect(JSON.stringify(stubs)).toEqual(JSON.stringify(expected));
  });

  describe('render stub', () => {
    let createElement;

    beforeEach(() => {
      createElement = jest.fn(tag => tag);
    });

    describe('render html elements', () => {
      const tag = 'div';

      it('should correctly render attributes', () => {
        const data = {
          attrs: {
            type: 'button',
          },
        };
        const htmlElement = [{ tag, data }];
        const context = {
          $vnode: {
            data: {},
            componentOptions: {
              tag: component1.name,
              children: htmlElement,
            },
          },
        };
        const expectedCalls = [
          [tag, data, undefined],
          [component1.name, { attrs: {} }, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render directives', () => {
        const directive = {
          rawName: 'v-custom-directive',
          expression: 'expression',
        };
        const data = {
          directives: [directive],
        };
        const htmlElement = [{ tag, data }];
        const context = {
          $vnode: {
            data: {},
            componentOptions: {
              tag: component1.name,
              children: htmlElement,
            },
          },
        };
        const expectedCalls = [
          [
            tag,
            {
              ...data,
              attrs: {
                [directive.rawName]: directive.expression,
              },
            },
            undefined,
          ],
          [component1.name, { attrs: {} }, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render event listeners', () => {
        const on = {
          click: { fns: { name: 'bound hadleclock' } },
          focus: { name: 'focus' },
          input: [{ name: 'input' }, { name: 'bound handleInput' }],
          confirm: undefined,
        };
        const data = { on };
        const htmlElement = [{ tag, data }];
        const context = {
          $vnode: {
            data: {},
            componentOptions: {
              tag: component1.name,
              children: htmlElement,
            },
          },
        };
        const expectedCalls = [
          [
            tag,
            {
              ...data,
              attrs: {
                'v-on:click': 'bound hadleclock',
                'v-on:input': 'bound handleInput',
              },
            },
            undefined,
          ],
          [component1.name, { attrs: {} }, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render v-model directive', () => {
        const model = {
          expression: 'expression',
        };
        const data = { model };
        const htmlElement = [{ tag, data }];
        const context = {
          $vnode: {
            data: {},
            componentOptions: {
              tag: component1.name,
              children: htmlElement,
            },
          },
        };
        const expectedCalls = [
          [
            tag,
            {
              ...data,
              attrs: {
                'v-model': model.expression,
              },
            },
            undefined,
          ],
          [component1.name, { attrs: {} }, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render children', () => {
        const childrenTag = 'span';
        const childrenData = {
          attrs: {},
        };
        const children = [{ tag: childrenTag, data: childrenData }, {}];
        const data = {
          attrs: {},
        };
        const htmlElement = [{ tag, data, children }];
        const context = {
          $vnode: {
            data: {},
            componentOptions: {
              tag: component1.name,
              children: htmlElement,
            },
          },
        };
        const expectedCalls = [
          [childrenTag, childrenData, undefined],
          [tag, data, [childrenTag, {}]],
          [component1.name, { attrs: {} }, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });
    });

    describe('render components', () => {
      const tag = 'custom-component';

      it('should correctly render attributes', () => {
        const data = {
          attrs: {
            type: 'button',
          },
        };
        const componentOptions = { tag };
        const context = {
          $vnode: { data, componentOptions },
        };
        const expectedCalls = [[tag, data, undefined]];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render directives', () => {
        const directive = {
          rawName: 'v-custom-directive',
          expression: 'expression',
        };
        const data = {
          directives: [directive],
        };
        const componentOptions = { tag };
        const context = {
          $vnode: { data, componentOptions },
        };
        const expectedCalls = [
          [
            tag,
            {
              ...data,
              attrs: {
                [directive.rawName]: directive.expression,
              },
            },
            undefined,
          ],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render event listeners', () => {
        const listeners = {
          click: { fns: { name: 'bound hadleclock' } },
          focus: { name: 'focus' },
          input: [{ name: 'input' }, { name: 'bound handleInput' }],
          confirm: undefined,
        };
        const data = {};
        const componentOptions = { tag, listeners };
        const context = {
          $vnode: { data, componentOptions },
        };
        const expectedCalls = [
          [
            tag,
            {
              ...data,
              attrs: {
                'v-on:click': 'bound hadleclock',
                'v-on:input': 'bound handleInput',
              },
              on: listeners,
            },
            undefined,
          ],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render v-model directive', () => {
        const model = {
          expression: 'expression',
        };
        const data = { model };
        const componentOptions = { tag };
        const context = {
          $vnode: { data, componentOptions },
        };
        const expectedCalls = [
          [
            tag,
            {
              ...data,
              attrs: {
                'v-model': model.expression,
              },
            },
            undefined,
          ],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render children', () => {
        const childrenTag = 'child-component';
        const childrenData = {
          attrs: {},
        };
        const childComponentOptions = { tag: childrenTag };
        const children = [
          { data: childrenData, componentOptions: childComponentOptions },
          {},
        ];
        const data = {
          attrs: {},
        };
        const componentOptions = { tag, children };
        const context = {
          $vnode: { data, componentOptions },
        };
        const expectedCalls = [
          [childrenTag, childrenData, undefined],
          [tag, data, [childrenTag, {}]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });
    });
  });
});
