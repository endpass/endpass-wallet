export default (
  action,
  payload,
  context,
  expectedMutations,
  expectedActions,
  done,
) => {
  let musationsCount = 0;
  let actionsCount = 0;

  const commit = type => {
    const mutation = expectedMutations[musationsCount];
    expect(type).toBe(mutation.type);
    musationsCount += 1;
  };

  // eslint-disable-next-line consistent-return
  const dispatch = type => {
    const action = expectedActions[actionsCount];
    expect(type).toBe(action.type);
    if (expectedActions[actionsCount].async) {
      return new Promise(res => {
        res();
      });
    }
    actionsCount += 1;
  };

  // eslint-disable-next-line no-param-reassign
  context.commit = commit;
  // eslint-disable-next-line no-param-reassign
  context.dispatch = dispatch;
  const res = action(context, payload);
  if (res instanceof Promise) {
    res.then(() => {
      setTimeout(() => {
        expect(musationsCount).toBe(expectedMutations.length);
        expect(actionsCount).toBe(expectedActions.length);
        done();
      });
    });
  } else {
    expect(musationsCount).toBe(expectedMutations.length);
    expect(actionsCount).toBe(expectedActions.length);
    done();
  }
};
