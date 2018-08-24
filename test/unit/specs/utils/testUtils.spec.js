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

    it('should create the correct number of subelements', () => {
      const context = {
        $slots: {
          default: [{}, {}],
          footer: [{}],
        },
      };
      const expectedElements = [{}, {}, {}];

      stubs[component1.name].render.call(context, createElement);

      expect(createElement).toHaveBeenCalledTimes(1);
      expect(createElement).toHaveBeenCalledWith(
        component1.name,
        expectedElements,
      );
    });

    describe('render html elements', () => {
      const tag = 'div';

      it('should correctly render attributes', () => {
        const data = {
          attrs: {
            type: 'button',
          },
        };
        const slot = [{ tag, data }];
        const context = {
          $slots: { slot },
        };
        const expectedCalls = [
          [tag, data, undefined],
          [component1.name, [tag]],
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
        const slot = [{ tag, data }];
        const context = {
          $slots: { slot },
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
          [component1.name, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render event listeners', () => {
        const on = {
          click: { name: 'bound hadleclock' },
          focus: { name: 'focus' },
          input: [{ name: 'input' }, { name: 'bound handleInput' }],
        };
        const data = { on };
        const slot = [{ tag, data }];
        const context = {
          $slots: { slot },
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
          [component1.name, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render v-model directive', () => {
        const model = {
          expression: 'expression',
        };
        const data = { model };
        const slot = [{ tag, data }];
        const context = {
          $slots: { slot },
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
          [component1.name, [tag]],
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
        const slot = [{ tag, data, children }];
        const context = {
          $slots: { slot },
        };
        const expectedCalls = [
          [childrenTag, childrenData, undefined],
          [tag, data, [childrenTag, {}]],
          [component1.name, [tag]],
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
        const slot = [{ tag, data, componentOptions }];
        const context = {
          $slots: { slot },
        };
        const expectedCalls = [
          [tag, data, undefined],
          [component1.name, [tag]],
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
        const componentOptions = { tag };
        const slot = [{ tag, data, componentOptions }];
        const context = {
          $slots: { slot },
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
          [component1.name, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });

      it('should correctly render event listeners', () => {
        const listeners = {
          click: { name: 'bound hadleclock' },
          focus: { name: 'focus' },
          input: [{ name: 'input' }, { name: 'bound handleInput' }],
        };
        const data = {};
        const componentOptions = { tag, listeners };
        const slot = [{ tag, data, componentOptions }];
        const context = {
          $slots: { slot },
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
          [component1.name, [tag]],
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
        const slot = [{ tag, data, componentOptions }];
        const context = {
          $slots: { slot },
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
          [component1.name, [tag]],
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
        const slot = [{ tag, data, componentOptions }];
        const context = {
          $slots: { slot },
        };
        const expectedCalls = [
          [childrenTag, childrenData, undefined],
          [tag, data, [childrenTag, {}]],
          [component1.name, [tag]],
        ];

        stubs[component1.name].render.call(context, createElement);

        expect(createElement.mock.calls).toEqual(expectedCalls);
      });
    });
  });
});
