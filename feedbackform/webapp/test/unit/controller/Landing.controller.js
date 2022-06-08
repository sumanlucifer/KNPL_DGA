/*global QUnit*/

sap.ui.define([
	"comknpldga/feedbackform/controller/Landing.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Landing Controller");

	QUnit.test("I should test the Landing controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
