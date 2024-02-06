window.$ = window.jQuery = require('jquery');

/**
 * A listener that determines which 'maximize' or 'unmaximize' buttons 
 * to display on the title bar
 */
window.apis.viewMaximizeBtn((event, value) => {
  if (value == 'unmaximize') {
    $('#unmaximize').hide();
    $('#maximize').show();
  } else if (value == 'maximize') {
    $('#unmaximize').show();
    $('#maximize').hide();
  }
});

export class Titlebar {
  isMaximized = false;

  constructor(_thisWindow) {
    this.initTitlebar(_thisWindow);
  }

  /**
   * A function that sets the appropriate click listener
   * for the title bar buttons of '_thisWindow'.
   * @param {*} _thisWindow 
   */
  initTitlebar(_thisWindow) {
    $('#minimize').on('click', function () {
      window.apis.minimize(_thisWindow);
    });

    $('#unmaximize').on('click', function () {
      this.isMaximized = !this.isMaximized;
      window.apis.unmaximize(_thisWindow);

      $('#unmaximize').hide();
      $('#maximize').show();
    });

    $('#maximize').on('click', function () {
      this.isMaximized = !this.isMaximized;
      window.apis.maximize(_thisWindow);

      $('#unmaximize').show();
      $('#maximize').hide();
    });

    $('#close').on('click', function () {
      window.apis.close(_thisWindow);
    });

  }
}
