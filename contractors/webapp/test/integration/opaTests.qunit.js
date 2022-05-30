/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["com/knpl/pragati/ContactPainter/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
