sap.ui.define([
    "../controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Fragment, Filter, FilterOperator, ValueState, formatter) {
        "use strict";

        return BaseController.extend("com.knpl.dga.leadmanagement.controller.SiteVisitDetail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("SiteVisitDetail").attachMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function (oEvent) {
                var sId = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Id
                );
                var sMode = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Mode
                );
                this._SetDisplayData(sId, sMode);

                this.getView().setModel(new JSONModel({
                    ToggleSiteImagesVisible: "Before",
                    SortSiteIMagesDescending: false
                }), "LocalViewModel");
            },

        }

        );
    }
);