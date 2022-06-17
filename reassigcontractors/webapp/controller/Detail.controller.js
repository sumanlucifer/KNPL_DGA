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
            "com.knpl.dga.ui5template.controller.Detail", {
            formatter: formatter,
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                //Deepanjali: Workflow interaction model
                this.oWorkflowModel = new JSONModel();
                this.oWorkflowModel.attachRequestCompleted(this._setWfData, this);
                this.getView().setModel(this.oWorkflowModel, "wfmodel");
                // var oModelView = new JSONModel();
                // this.getView().setModel(oModelView, "oModelView");
                //End
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
                var sId = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Id
                );
                var sMode = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Mode
                );
                this._SetDisplayData(sId);
            },
            _SetDisplayData: function (oProp) {
                var oData = {
                    bindProp: "ContractorReassignmentRequests(" + oProp + ")",
                    Id: oProp,
                    EntitySet: "ContractorReassignmentRequests",
                    PageBusy: true,
                    IcnTabKey: "0",
                    resourcePath: "com.knpl.dga.ui5template",
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelDisplay");
                // if (sMode == "Edit") {
                //     this._initEditData();
                // } else {
                //     this._initDisplayData();
                // }
                this._initDisplayData();
            },
            _initDisplayData: function () {
                var c1, c2, c3;
                var oModel = this.getView().getModel("oModelDisplay");
                var oData = oModel.getData();
                var othat = this;
                oModel.setProperty("/PageBusy", true);
                // c1 = othat._CheckLoginData();
                c2 = othat._getDisplayData(oData["bindProp"]);
                c2.then(function () {
                    c3 = othat._LoadFragment("DisplayDetails");
                    c3.then(function () {
                        oModel.setProperty("/PageBusy", false)
                    })
                });
            },

            _CheckLoginData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel();
                var oLoginModel = oView.getModel("LoginInfo");
                var oControlModel = oView.getModel("oModelDisplay");
                var oLoginData = oLoginModel.getData();
                if (Object.keys(oLoginData).length === 0) {
                    return new Promise((resolve, reject) => {
                        oData.callFunction("/GetLoggedInAdmin", {
                            method: "GET",
                            urlParameters: {
                                $expand: "UserType",
                            },
                            success: function (data) {
                                if (data.hasOwnProperty("results")) {
                                    if (data["results"].length > 0) {
                                        oLoginModel.setData(data["results"][0]);
                                        oControlModel.setProperty(
                                            "/LoggedInUser",
                                            data["results"][0]
                                        );
                                    }
                                }
                                resolve();
                            },
                        });
                    });
                } else {
                    oControlModel.setProperty("/LoggedInUser", oLoginData);
                    promise.resolve();
                    return promise;
                }
            },
            _getDisplayData: function (oProp) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var exPand = "Lead,DGADetails,PreviousContractor,ReassignedContractor,ReassignmentStatus";
                var othat = this;
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/" + oProp,
                        parameters: {
                            expand: exPand,
                        },
                        events: {
                            dataRequested: function (oEvent) {
                                //  oView.setBusy(true);
                            },
                            dataReceived: function (oEvent) {
                                //  oView.setBusy(false);
                            },
                        },
                    });
                }
                promise.resolve();
                return promise;
            },

            onBeforeRebindHistoryTable: function (oEvent) {
                var oView = this.getView();
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.sorter.push(new Sorter("UpdatedAt", true));
            },
            _LoadFragment: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("oVBoxAddObjectPage");
                var sResourcePath = oView.getModel("oModelDisplay").getProperty("/resourcePath")
                oVboxProfile.destroyItems();
                return this._getViewFragment(mParam).then(function (oControl) {
                    oView.addDependent(oControl);
                    oVboxProfile.addItem(oControl);
                    promise.resolve();
                    return promise;
                });
            },
            _setWfData: function () {
                //TODO: format subject FORCETAT
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelDisplay");
                var aWfData = this.oWorkflowModel.getData(),
                    taskSet = new Set([
                        "WORKFLOW_STARTED",
                        "WORKFLOW_COMPLETED",
                        "WORKFLOW_CANCELED",
                        "USERTASK_CREATED",
                        "USERTASK_COMPLETED",
                        "MAILTASK_COMPLETED",
                        "USERTASK_CANCELED_BY_BOUNDARY_EVENT", //TODO: Change text to TAT triggered
                    ]);
                aWfData = aWfData.filter(ele => taskSet.has(ele.type));
                this.oWorkflowModel.setData(aWfData);
                oModelControl.setProperty("/PageBusy", false)
            },
            _getExecLogData: function () {
                var promise = jQuery.Deferred();
                //for Test case scenerios delete as needed
                var oView = this.getView();
                var oDataModel = this.getView().getModel();
                var oData = oView.getElementBinding().getBoundContext().getObject();
                var sWorkFlowInstanceId = oData["WorkflowInstanceId"];
                // var sWorkFlowInstanceId = "0bca39c3-c55f-11ec-a2a9-eeee0a85c968";
                var oModel = this.getView().getModel("oModelDisplay");
                oModel.setProperty("/PageBusy", true)
                if (sWorkFlowInstanceId) {
                    // var sUrl =
                    //     "/comknpldgaui5template/bpmworkflowruntime/v1/workflow-instances/" +
                    //     sWorkFlowInstanceId +
                    //     "/execution-logs";
                    // this.oWorkflowModel.loadData(sUrl);
                    oDataModel.callFunction("/GetExecutionLogs", {    // function import name
                        method: "GET",                             // http method
                        urlParameters: { "workFlowInstanceId": sWorkFlowInstanceId }, // function import parameters        
                        success: function (oData, response) {
                            var oJSONData = JSON.parse(response.data.Response);
                            this.oWorkflowModel.setData(oJSONData);
                            oModel.setProperty("/PageBusy", false);
                        }.bind(this),      // callback function for success
                        error: function (oError) {
                            this.oWorkflowModel.setData([]);
                            oModel.setProperty("/PageBusy", false);
                        }                  // callback function for error
                    });
                } else {
                    this.oWorkflowModel.setData([]);
                    oModel.setProperty("/PageBusy", false);
                }
                promise.resolve();
                return promise;
            },
            onIcnTbarChange: function (oEvent) {
                var oView = this.getView();
                var sKey = oEvent.getSource().getSelectedKey();
                //oHistoryTable.rebindTable();
                if (sKey === "0") {
                } else if (sKey === "1") {
                    var oTable = oView.byId("smartHistory");
                    oTable.rebindTable();
                } else if (sKey === "2") {
                    this._getExecLogData()
                }
            },
            onPressSave: function () {
                var bValidateForm = this._ValidateForm();
                if (bValidateForm) {
                    this._postDataToSave();
                }
            },
            _postDataToSave: function () {
                /*
                 * Author: manik saluja
                 * Date: 02-Dec-2021
                 * Language:  JS
                 * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
                 */
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                oModelControl.setProperty("/PageBusy", true);
                var othat = this;
                var c1, c2, c3;
                c1 = othat._CheckEmptyFieldsPostPayload();
                c1.then(function (oPayload) {
                    c2 = othat._UpdatedObject(oPayload)
                    c2.then(function () {
                        c3 = othat._uploadFile();
                        c3.then(function () {
                            oModelControl.setProperty("/PageBusy", false);
                            othat.onNavToHome();
                        })
                    })
                })
            },
            _UpdatedObject: function (oPayLoad) {
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oModelControl = oView.getModel("oModelControl");
                var sProp = oModelControl.getProperty("/bindProp")
                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + sProp, oPayLoad, {
                        success: function (data) {
                            MessageToast.show(othat.geti18nText("Message1"));
                            resolve(data);
                        },
                        error: function (data) {
                            MessageToast.show(othat.geti18nText("Message2"));
                            oModelControl.setProperty("/PageBusy", false);
                            reject(data);
                        },
                    });
                });
            }
        }
        );
    }
);