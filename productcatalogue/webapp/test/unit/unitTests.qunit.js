/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comknpldgauitemplate/knplui5teplate/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
