sap.ui.define(
    [
        "../controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "../controller/Validator",
        "sap/ui/core/ValueState",
        "../model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        MessageBox,
        MessageToast,
        Fragment,
        Filter,
        FilterOperator,
        Sorter,
        Validator,
        ValueState,
        formatter
    ) {
        "use strict";
        return BaseController.extend(
            "com.knpl.dga.dealers.controller.DealerDetail", {
            formatter: formatter,
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("DealerDetail").attachMatched(this._onRouteMatched, this);
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    if (oEvent.getParameter("element").getRequired()) {
                        oEvent.getParameter("element").setValueState(ValueState.Error);
                    } else {
                        oEvent.getParameter("element").setValueState(ValueState.None);
                    }
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });
            },
            callVisitDetails: function (sId) {
                // var sVisitTargetIDFilter = new sap.ui.model.Filter({
                //     path: "VisitTargetId",
                //     operator: sap.ui.model.FilterOperator.EQ,
                //     value1: sId
                // });
                // var sTaskTypeIdFilter = new sap.ui.model.Filter({
                //     path: "TaskTypeId",
                //     operator: sap.ui.model.FilterOperator.EQ,
                //     value1: 2
                // });
                // var filter = [];
                // filter.push(sVisitTargetIDFilter, sTaskTypeIdFilter);
                var s= 56;
                this.getOwnerComponent().getModel().read(`/Visits(${s})`, {
                    // filters: [filter],
                    // urlParameters: {
                    //     "$expand": "DGA"
                    // },
                    success: function (oData, oResponse) {
                        // this.dataBuilding(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },
            _onRouteMatched: function (oEvent) {
                var id = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Id
                );
                var oView = this.getView();
                var oViewModel = {
                    busy: false
                };
                oView.setModel(new JSONModel(oViewModel), "oViewModel");
                var exPand = "DGA,DGA/Positions,DGA/Depot,DGA/Pincode"
            //    this.callVisitDetails();
                if (id.trim() !== "") {
                    oView.bindElement({
                        path: `/Visits(${id})`,
                        parameters: {
                            expand: exPand,
                        },
                        events: {
                            dataReceived: function (oEvent) {
                                debugger;
                                oEvent.getParameter("data");
                            }
                        }
                    });
                }
            }
        }
        );
    });
