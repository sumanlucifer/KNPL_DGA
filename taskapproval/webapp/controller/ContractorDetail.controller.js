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
            "com.knpl.dga.taskapproval.controller.ContractorDetail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("ContractorDetail").attachMatched(this._onRouteMatched, this);
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
            _onRouteMatched: function (oEvent) {
                var context = window.decodeURIComponent(
                    oEvent.getParameter("arguments").context
                );
                var oView = this.getView(), othat = this;
                var oModel = new JSONModel({});
                oView.setModel(oModel, "contractorModel");
                var exPand = "Visit/DGA,Visit/TaskType,Status,Visit/TargetContractor";
                if (context.trim() !== "") {
                    oView.bindElement({
                        path: "/" + context,
                        parameters: {
                            expand: exPand,
                        },
                        events: {
                            dataReceived: function(oEvent){
                                othat._fetchContractor(oEvent.getParameter("data").Visit.TargetContractor.ContractorId);
                            }
                        }
                    });
                }
                // othat._fetchContractor();
            },
            onPressApprove:function(oEvent){
                var oContext = oEvent.getSource().getBindingContext().getPath(), othat = this;
                this._updateTask(oContext, "2", "Approved").then(function(){
                    MessageToast.show("Task Approved Successfully.");
                    setTimeout(function demo() {
                        othat.onNavToHome();
                    }, 3000);
                }).catch(function(err){ MessageToast.show("Something Went Wrong..!"); });
            },
            onPressReject:function(oEvent){
                var oContext = oEvent.getSource().getBindingContext().getPath(), othat = this;
                this._updateTask(oContext, "3", "Rejected").then(function(){
                    MessageToast.show("Task Rejected Successfully.");
                    setTimeout(function demo() {
                        othat.onNavToHome();
                    }, 3000);
                }).catch(function(err){ MessageToast.show("Something Went Wrong..!"); });
            }
        }
    );
});