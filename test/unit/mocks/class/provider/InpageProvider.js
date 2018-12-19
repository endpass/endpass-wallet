jest.mock('@/class/provider/InpageProvider', () => {
  class InpageProvider {}

  return InpageProvider;
});
