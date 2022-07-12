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
            "com.knpl.dga.taskapproval.controller.Detail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
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
                var oViewModel = {
                    busy: true
                };
                oView.setModel(new JSONModel(oViewModel), "oViewModel");
                var exPand = "Visit/TargetLead/Dealer,Visit/TargetLead/AssignedContractors,Visit/TargetLead/AssignedContractors/Contractor,Visit/TargetLead/SourceConsumer,Visit/LeadVisitOutcomeDetails/VisitsOutcome,Visit/LeadVisitOutcomeDetails/LeadLostReason,Visit/LeadVisitOutcomeDetails/CompetitionBrand,Visit/LeadVisitOutcomeDetails/CompetitorServiceType,Visit/DGA/Positions,Visit/TaskType,Status,Visit/TargetLead/SourceDealer,Visit/TargetLead/LeadSource,Visit/TargetLead/SourceContractor,Visit/TargetLead/LeadStatus,Visit/TargetLead/LeadServiceType,Visit/TargetLead/LeadServiceSubType,Visit/TargetLead/LeadSelectedPaintingRequests/MasterPaintingReq,Visit/TargetLead/PaintType,Visit/TargetLead/PaintingReqSlab,Visit/TargetContractor,Visit/TargetDealer,Visit/TargetLead/LeadLostReason,Visit/TargetLead/CompetitionBrand,Visit/TargetLead/CompetitorServiceType,Visit/TargetLead/ShortClosureReason";
                if (context.trim() !== "") {
                    oView.bindElement({
                        path: "/" + context,
                        parameters: {
                            expand: exPand,
                        },
                        events: {
                            dataReceived: function(oEvent){
                                if(oEvent.getParameter("data").Visit.TargetLead.SourceContractorId){
                                    othat._fetchContractor(oEvent.getParameter("data").Visit.TargetLead.SourceContractorId);
                                }
                                else {
                                    othat.getView().getModel("oViewModel").setProperty("/busy", false);
                                }
                            }
                        }
                    });
                }
                if(oView.getModel("contractorModel") && oView.getBindingContext()){
                    if(oView.getModel("contractorModel").getProperty("/TargetContractor/Id") != oView.getBindingContext().getObject("Visit/TargetLead/SourceContractorId"))
                        othat._fetchContractor(oView.getBindingContext().getObject("Visit/TargetLead/SourceContractorId"));
                    else 
                        othat.getView().getModel("oViewModel").setProperty("/busy", false);
                }
                else {
                    othat.getView().getModel("oViewModel").setProperty("/busy", false);
                }
            },
            onPressApprove:function(oEvent){
                var oContext = oEvent.getSource().getBindingContext().getPath(), othat = this;
                MessageBox.confirm("Do you want to Approve the Task?", {
                    actions: ["Yes", MessageBox.Action.NO],
                    emphasizedAction: "Yes",
                    onClose: function (sAction) {
                        if(sAction !== "NO"){
                            othat.getView().getModel("oViewModel").setProperty("/busy", true);
                            othat._updateTask(oContext, "2", "Approved").then(function(){
                                MessageToast.show("Task Approved Successfully.");
                                othat.getView().getModel().refresh();
                                setTimeout(function demo() {
                                    othat.getView().getModel("oViewModel").setProperty("/busy", false);
                                    othat.onNavToHome();
                                }, 3000);
                            }).catch(function(err){ 
                                othat.getView().getModel("oViewModel").setProperty("/busy", false);
                                MessageToast.show("Something Went Wrong..!"); 
                            });
                        }
                    }
                });
            },
            onPressReject:function(oEvent){
                var oContext = oEvent.getSource().getBindingContext().getPath(), othat = this;
                MessageBox.confirm("Do you want to Reject the Task?", {
                    actions: ["Yes", MessageBox.Action.NO],
                    emphasizedAction: "Yes",
                    onClose: function (sAction) {
                        if(sAction !== "NO"){
                            othat.getView().getModel("oViewModel").setProperty("/busy", true);
                            othat._updateTask(oContext, "3", "Rejected").then(function(){
                                MessageToast.show("Task Rejected Successfully.");
                                othat.getView().getModel().refresh();
                                setTimeout(function demo() {
                                    othat.getView().getModel("oViewModel").setProperty("/busy", false);
                                    othat.onNavToHome();
                                }, 3000);
                            }).catch(function(err){ 
                                othat.getView().getModel("oViewModel").setProperty("/busy", false);
                                MessageToast.show("Something Went Wrong..!"); 
                            });
                        }
                    }
                });
            }
        }
    );
});