/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["com/knpl/dga/uitemplate/knplui5teplate/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
