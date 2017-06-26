import { NgNotificationPage } from './app.po';

describe('ng-notification App', () => {
  let page: NgNotificationPage;

  beforeEach(() => {
    page = new NgNotificationPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
