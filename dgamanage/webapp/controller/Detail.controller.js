+
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
                "com.knpl.dga.dgamanage.controller.Detail", {
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
                    var sId = window.decodeURIComponent(
                        oEvent.getParameter("arguments").Id
                    );
                    var sMode = window.decodeURIComponent(
                        oEvent.getParameter("arguments").Mode
                    );
                    this._SetDisplayData(sId, sMode);

                },
                _SetDisplayData: function (oProp, sMode) {
                    var sModeA = sMode;
                    if (sModeA === "ReplaceDga") {
                        sModeA = "Edit";
                    }
                    var oData = {
                        mode: sModeA,
                        bindProp: "DGAs(" + oProp + ")",
                        Id: oProp,
                        PageBusy: true,
                        IcnTabKey: "0",
                        resourcePath: "com.knpl.dga.dgamanage",
                        ChangeStatus: {

                        },
                        Performance: {
                            StartDate: new Date(new Date().setDate(1)),
                            EndDate: new Date()
                        },
                        MultiCombo: {
                            Dealers: [],
                            Pincode2: []
                        }
                    };
                    var oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "oModelDisplay");
                    if (sMode == "Edit") {
                        this._initEditData();
                    } else if (sMode.toUpperCase() === "REPLACEDGA") {
                        this._initEditDataReplaceDga();
                    } else {
                        this._initDisplayData();
                    }

                },
                _initDisplayData: function () {
                    var c1, c2, c3;
                    var oModel = this.getView().getModel("oModelDisplay");
                    var oData = oModel.getData();
                    var othat = this;
                    oModel.setProperty("/PageBusy", true);
                    // c1 = othat._CheckLoginData();
                    c1 = othat._dummyPromise();
                    c1.then(function () {
                        c2 = othat._LoadFragment("DisplayDetails");
                        c2.then(function () {
                            c3 = othat._getDisplayData(oData["bindProp"]);
                            c3.then(function () {
                                oModel.setProperty("/PageBusy", false)
                            })
                        })
                    })
                },
                _getDisplayData: function (oProp) {

                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelDisplay");
                    var exPand = "PayrollCompany,Division,Pincode,State,WorkLocation,Positions/ChildTowns/WorkLocation,Positions/ServicePincodes/Pincode";
                    var othat = this;
                    if (oProp.trim() !== "") {
                        return new Promise((resolve, reject) => {
                            oView.bindElement({
                                path: "/" + oProp,
                                parameters: {
                                    expand: exPand
                                },
                                events: {
                                    dataRequested: function (oEvent) {

                                    },
                                    dataReceived: function (oEvent) {

                                        resolve();
                                    },
                                },
                            });
                        })

                    }

                },

                _initEditData: function () {
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelDisplay");
                    oModel.setProperty("/PageBusy", true);
                    var sProp = oModel.getProperty("/bindProp")
                    oModel.setProperty("/mode", "Edit");
                    var oData = oModel.getData();
                    var c1, c1A, c2, c2A, c3, c4, c5, c6, c7;
                    var c1 = othat._AddObjectControlModel("Edit", oData["Id"]);
                    oModel.setProperty("/PageBusy", true);
                    c1.then(function () {
                        c1A = othat._dummyPromise();
                        c1A.then(function () {
                            c2 = othat._setInitViewModel();
                            c2.then(function () {
                                c2A = othat._dummyPromise(oModel.getProperty("/bindProp"));
                                c2A.then(function () {
                                    c3 = othat._LoadFragment("AddNewObject");
                                    c3.then(function () {
                                        c4 = othat._SetFiltersForControls();
                                        c4.then(function (oPayLoad) {
                                            c5 = othat._setEditPopoverData(oPayLoad);
                                            c5.then(function (oPayLoad) {
                                                c6 = othat._dummyPromise(oPayLoad)
                                                c6.then(function () {
                                                    oModel.setProperty("/PageBusy", false);
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                },
                _initEditDataReplaceDga: function () {
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelDisplay");
                    oModel.setProperty("/PageBusy", true);
                    var sProp = oModel.getProperty("/bindProp")
                    oModel.setProperty("/mode", "Edit");
                    var oData = oModel.getData();
                    var c1, c1A, c2, c2A, c3, c4, c5, c6, c7;
                    var c1 = othat._AddObjectControlModel("Edit", oData["Id"]);
                    oModel.setProperty("/PageBusy", true);
                    c1.then(function () {
                        c1A = othat._getDisplayData(sProp);
                        c1A.then(function () {
                            c2 = othat._setInitViewModel();
                            c2.then(function () {
                                c2A = othat._dummyPromise(oModel.getProperty("/bindProp"));
                                c2A.then(function () {
                                    c3 = othat._LoadFragment("AddNewObject2");
                                    c3.then(function () {
                                        c4 = othat._SetFiltersForControls();
                                        c4.then(function (oPayLoad) {
                                            c5 = othat._setEditPopoverData(oPayLoad);
                                            c5.then(function (oPayLoad) {
                                                c6 = othat._EditReplaceDgaAddFlags(oPayLoad)
                                                c6.then(function () {
                                                    oModel.setProperty("/PageBusy", false);
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })

                },
                _EditReplaceDgaAddFlags: function () {
                    var promise = $.Deferred();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var aFields = ["GivenName", "Mobile", "PayrollCompanyId", "EmployeeId", "JoiningDate", "ExitDate"]
                    this._propertyToBlank(aFields);
                    oModelView.setProperty("/ReplacedDGAId", oModelView.getProperty("/Id"));
                    this._showMessageToast("Message24");
                    promise.resolve();
                    return promise;
                },
                _setAdditioanFlags: function (oPayLoad) {
                    var promise = $.Deferred();
                    var oModel = this.getModel("oModelControl");
                    var pattern = "dd/MM/yyyy";
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: pattern
                    });
                    oDateFormat.format(oPayLoad["JoiningDate"])


                    promise.resolve(oPayLoad);
                    return promise;
                },
                _setEditPopoverData: function (oPayLoad) {
                    var promise = $.Deferred();
                    // set the data for pin code proper.
                    var oModeControl = this.getModel("oModelControl");
                    if (oPayLoad["Pincode"]) {
                        oModeControl.setProperty("/AddFields/PinCode", oPayLoad["Pincode"]["Name"])
                    }

                    var aArra1 = [];
                    if (oPayLoad["Positions"]["results"][0]["ServicePincodes"]["results"].length > 0) {
                        for (var x of oPayLoad["Positions"]["results"][0]["ServicePincodes"]["results"]) {
                            aArra1.push({
                                Id: x["PincodeId"],
                                Name: x["Pincode"]["Name"],
                            });
                        }
                    }
                    oModeControl.setProperty("/MultiCombo/Pincode2", aArra1);
                    var aArray2 = [];
                    if (oPayLoad["Positions"]["results"][0]["ChildTowns"]["results"].length > 0) {
                        for (var x of oPayLoad["Positions"]["results"][0]["ChildTowns"]["results"]) {
                            aArray2.push({
                                Id: x["WorkLocationId"],
                                TownName: x["WorkLocation"]["TownName"],
                                TownId: x["WorkLocation"]["TownId"]
                            });
                        }
                    }
                    oModeControl.setProperty("/MultiCombo/ChildTowns", aArray2);
                    var aArra3 = [];
                    if (oPayLoad["Positions"]["results"].length > 0) {
                        for (var x of oPayLoad["Positions"]["results"]) {
                            aArra3.push({
                                Id: x["DepotId"],
                                Name: x["Depot"]["Depot"],
                            });
                        }
                    }
                    oModeControl.setProperty("/MultiCombo/Depots", aArra3);
                    promise.resolve(oPayLoad);
                    return promise;
                },
                onPressEdit: function () {
                    var oView = this.getView();
                    var sId = oView.getModel("oModelDisplay").getProperty("/Id")
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Detail", {
                        Id: sId,
                        Mode: "Edit"
                    });
                },
                _SetFiltersForControls: function () {
                    var promise = $.Deferred();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oPayload = oModelView.getData();



                    var sZoneId = oPayload["Zone"];
                    if (sZoneId !== null) {
                        oView
                            .byId("idDivision")
                            .getBinding("items")
                            .filter(new Filter("Zone", FilterOperator.EQ, sZoneId));
                    }
                    var sDivisionId = oPayload["DivisionId"];

                    var sDepotId = oPayload["Positions"]["results"][0]["DepotId"];
                    var sStateKey = oPayload["StateId"];
                    // workfloaction field filters
                    if (sStateKey) {
                        var aFilter = [];
                        if (sZoneId) {
                            aFilter.push(new Filter("Zone", FilterOperator.EQ, sZoneId))
                        }
                        if (sDivisionId) {
                            aFilter.push(new Filter("DivisionId", FilterOperator.EQ, sDivisionId))
                        }
                        if (sDepotId) {
                            aFilter.push(new Filter("DepotId", FilterOperator.EQ, sDepotId));
                        }
                        if (sStateKey) {
                            aFilter.push(new Filter("StateId", FilterOperator.EQ, sStateKey));
                        }
                        var aFilterMain = new Filter(aFilter, true);

                        oView.byId("cmbxJobLoc").getBinding("items").filter(aFilterMain);
                    }
                    promise.resolve(oPayload);
                    return promise;



                },
                _setInitViewModel: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelDisplay");
                    var oModelControl = this.getModel("oModelControl")
                    var oProp = oModel.getProperty("/bindProp");
                    var exPand = "Pincode,Positions/Depot,Positions/ChildTowns/WorkLocation,Positions/ServicePincodes/Pincode";
                    return new Promise((resolve, reject) => {
                        oView.getModel().read("/" + oProp, {
                            urlParameters: {
                                $expand: exPand,
                            },
                            success: function (data) {

                                var oModel = new JSONModel(data);
                                var pattern = "dd/MM/yyyy";
                                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                                    pattern: pattern
                                });

                                var aDate1 = oDateFormat.format(data["JoiningDate"]);
                                var aDate2 = oDateFormat.format(data["ExitDate"]);
                                oModelControl.setProperty("/AddFields/JoiningDate", aDate1);
                                oModelControl.setProperty("/AddFields/ExitDate", aDate2);

                                oView.setModel(oModel, "oModelView");

                                oModel.refresh(true)
                                resolve(data);
                            },
                            error: function () { },
                        });
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

                //#Icontabar change
                onIcnTbarChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModel1 = oView.getModel("oModelDisplay");
                    var sEntitySet = oModel1.getProperty("/bindProp");
                    var sDgaId = oModel1.getProperty("/Id");

                    if (sKey == "1") {
                        oView.byId("Dealerstable").setEntitySet(sEntitySet);

                    } else if (sKey == "2") {
                        var oTable = oView.byId("idContractorTable")
                        oTable.bindItems({
                            path: "/MapDGAContractors",
                            template: oView.byId("oColumListItemContrators"),
                            templateShareable: true,
                            parameters: {
                                expand: 'Contractor,Dealer',
                            },
                            filters: [new Filter("DGAId", FilterOperator.EQ, sDgaId), new Filter("IsLinked", FilterOperator.EQ, true)]

                        })

                    } else if (sKey == "3") {
                        oView.byId("idLeadsTable").rebindTable();
                    } else if (sKey == "4") {
                        oView.byId("idLeadByStatus").rebindTable();
                        oView.byId("idLeadBySource").rebindTable();
                        oView.byId("idBusinessGenValByCategory").rebindTable();
                        oView.byId("idBusinessGenVolByCategory").rebindTable();
                        oView.byId("idBusinessGenValByClassification").rebindTable();
                        oView.byId("idBusinessGenVolByClassification").rebindTable();
                    } else if (sKey == "5") {
                        oView.byId("idDgaReplaceTbl").rebindTable();
                    }
                },
                // #smart table filters
                onBeforeRebindDealersTable: function (oEvent) {
                    var oView = this.getView();
                    var sDgaId = oView.getModel("oModelDisplay").getProperty("/Id");
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "Dealer/DealerSalesDetails";
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                },
                onBeforeBindLeadsTable: function (oEvent) {
                    var oView = this.getView();
                    var sDgaId = oView.getModel("oModelDisplay").getProperty("/Id")
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "LeadServiceType,State,Depot,LeadStatus,PaintingReqSlab";
                    var oFiler = new Filter("DGAId", FilterOperator.EQ, sDgaId)
                    oBindingParams.filters.push(oFiler);
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                },
                onBeforeBindContractorTbl: function (oEvent) {

                    var oView = this.getView();
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    // oBindingParams.parameters["expand"] = "Contractor";
                    // var oFiler = new Filter("IsLinked", FilterOperator.EQ, true);
                    // oBindingParams.filters.push(oFiler);
                    // oBindingParams.sorter.push(new Sorter("CreatedAt", true));
                },
                onBeforeBindDgaReplaceTbl: function (oEvent) {
                    var oView = this.getView();
                    var oData=oView.getModel();
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "DGA";
                    var aPositions = this.getView().getElementBinding().getBoundContext().getObject()["Positions"];
                    var sObj, sPositionCode = null;
                    if (Array.isArray(aPositions["__list"])) {
                        sObj = oData.getProperty("/" + aPositions["__list"][0]);
                        sPositionCode = sObj["PositionCode"];
                    }
                    if (sPositionCode) {
                        oBindingParams.filters.push(new Filter(
                            "PositionCode",
                            FilterOperator.EQ,
                            sPositionCode
                        ));
                    }

                },
                // #perfrmance smart table
                rebindLeadByStatusTbl: function (oEvent) {
                    var oView = this.getView();
                    var oModelDisplay = oView.getModel("oModelDisplay")
                    var sDgaId = oModelDisplay.getProperty("/Id")
                    var oDateFormat = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd" });
                    var dStartDate = oDateFormat.format(oModelDisplay.getProperty("/Performance/StartDate"));
                    var dEndDate = oDateFormat.format(oModelDisplay.getProperty("/Performance/EndDate"));
                    var oCustom = {
                        //StartDate: null,
                        //EndDate: null,
                        DGAId: "" + sDgaId + "",
                    };
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    // oBindingParams.sorter.push(new sap.ui.model.Sorter('LEAD_STATUS_ID', true));
                    if (oCustom) {
                        oBindingParams.parameters.custom = oCustom;
                    }
                },

                _LoadFragment: function (mParam) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oVboxProfile = oView.byId("oVBoxAddObjectPage");
                    oVboxProfile.destroyItems();
                    return this._getViewFragment(mParam).then(function (oControlProfile) {
                        oView.addDependent(oControlProfile);
                        oVboxProfile.addItem(oControlProfile);
                        promise.resolve();
                        return promise;
                    });
                },
                _handleDealersValueHelpConfirm: function (oEvent) {
                    var oSelected = oEvent.getParameter("selectedContexts");
                    var oView = this.getView();
                    var oModelDisplay = oView.getModel("oModelDisplay");
                    var sDgaId = oModelDisplay.getProperty("/Id")
                    var aDealersSelected = [],
                        oBj;
                    for (var a of oSelected) {
                        oBj = a.getObject();
                        aDealersSelected.push({
                            //Name: oBj["Name"],
                            Id: oBj["Id"],
                        });
                    }
                    if (aDealersSelected.length < 1) {
                        this._showMessageToast("Message20");
                        this._onDialogClose();
                        return;
                    }

                    var aExistingDealers = []//oModelView.getProperty("/DGADealers");
                    var aSelectedDealers = aDealersSelected
                    var iDealers = -1;
                    var aDealers = [];
                    for (var x of aSelectedDealers) {
                        iDealers = aExistingDealers.findIndex(item => item["Id"] === x["Id"])
                        if (iDealers >= 0) {
                            //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                            aDealers.push(oPayload["DGADealers"][iDealers]);
                        } else {
                            aDealers.push({ DealerId: x["Id"], DGAId: sDgaId });
                        }
                    }

                    var oDataModel = oView.getModel();
                    var oPayload = {
                        MapDGADealers: aDealers
                    }


                    oModelDisplay.setProperty("/PageBusy", true);
                    oDataModel.create("/MapDGADealersList", oPayload, {
                        success: function (oEvent) {
                            oModelDisplay.setProperty("/PageBusy", false);
                            this.getView().getElementBinding().refresh(true);
                            this._showMessageToast("Message17");
                        }.bind(this),
                        error: function (oData) {
                            oModelDisplay.setProperty("/PageBusy", false);
                            if (oData.hasOwnProperty("responseText")) {
                                if (oData["statusCode"] === 409) {
                                    this._showMessageBox2("error", "Message13", [oData.responseText]);
                                }
                            }

                        }.bind(this)
                    })
                    this._onDialogClose();
                },

                onPressSave: function () {
                    var bValidateForm = this._ValidateForm();
                    var bValidateFields = this._ValidateEmptyFields.bind(this);
                    if (bValidateForm) {
                        if (bValidateFields()) {
                            this._postDataToSave();
                        }
                    }

                },
                _ValidateForm: function () {
                    var oView = this.getView();
                    var oValidate = new Validator();
                    var othat = this;
                    var oForm = oView.byId("FormObjectData");
                    var bFlagValidate = oValidate.validate(oForm, true);
                    if (!bFlagValidate) {
                        othat._showMessageToast("Message3")
                        return false;
                    }
                    return true;
                },
                _postDataToSave: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
                     */
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelDisplay");
                    oModelControl.setProperty("/PageBusy", true);
                    var othat = this;
                    var c1, c1b, c2, c3;
                    c1 = othat._CheckEmptyFieldsPostPayload();
                    var aFailureCallback = this._onCreationFailed.bind(this);
                    c1.then(function (oPayload) {
                        var c1b = othat._AddMultiComboDataEdit(oPayload);
                        c1b.then(function (oPayload) {
                            c2 = othat._UpdatedObject(oPayload)
                            c2.then(function () {
                                c3 = othat._uploadFile();
                                c3.then(function () {
                                    oModelControl.setProperty("/PageBusy", false);
                                    var oRouter = othat.getOwnerComponent().getRouter();
                                    oRouter.navTo("worklist", {}, true);
                                })
                            }, aFailureCallback)
                        })

                    })


                },
                _ReoveEditPayloadProps: function (oPayLoad) {
                    var promise = $.Deferred();
                    var aArrayRemoveProp1 = [];

                    for (var x of aArrayRemoveProp) {
                        if (oPayLoad.hasOwnProperty(x)) {
                            delete oPayLoad[x];
                        }
                    }
                    //"ServicePincodes/Pincode"
                    return promise;
                },
                onChangeStatus: function () {
                    var oView = this.getView(),
                        aStatus = [{
                            key: "ACTIVATED"
                        }, {
                            key: "DEACTIVATED"
                        }],
                        oModelControl = oView.getModel("oModelDisplay"),
                        sCurrentStatus = oView.getBindingContext().getProperty("ActivationStatus"),
                        oChangeStatus = {
                            aApplicableStatus: aStatus.filter(ele => ele.key != sCurrentStatus),
                            oPayload: {
                                ActivationStatus: "",
                                ActivationStatusChangeReason: ""
                            }
                        };
                    oModelControl.setProperty("/ChangeStatus", oChangeStatus);
                    // create dialog lazily
                    if (!this._ChangeStatus) {
                        // load asynchronous XML fragment
                        this._getViewFragment("ChangeStatus").then(function (oControl) {
                            /// console.log(oControl)
                            this._ChangeStatus = oControl;
                            oView.addDependent(this._ChangeStatus);
                            this._ChangeStatus.open();
                        }.bind(this));
                    } else {
                        this._ChangeStatus.open();
                    }
                },
                onConfirmStatus: function () {
                    var oPayload = this.getView().getModel("oModelDisplay").getProperty("/ChangeStatus/oPayload");
                    if (!oPayload.ActivationStatus) {
                        this._showMessageToast("Message15")
                        return;
                    }
                    if (!oPayload.ActivationStatusChangeReason) {
                        this._showMessageToast("Message16")
                        return;
                    }

                    var sPath = this.getView().getBindingContext().getPath();

                    this.getView().getModel().update(sPath +
                        "/ActivationStatus", oPayload, {
                        success: function () {
                            MessageToast.show(`Status has been changed to ${oPayload.ActivationStatus}`);
                            this._onDialogClose();
                            this.getView().getElementBinding().refresh();
                        }.bind(this)
                    })
                },

                _AddMultiComboDataEdit: function (oPayload) {
                    var promise = $.Deferred();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var sMode = oModelControl.getProperty("/mode");
                    var sResults = ""
                    if (sMode === "Edit") {
                        sResults = "/results"
                    }
                    //Depot Related Data.
                    var aExistingData = oModelView.getProperty("/Positions" + sResults);
                    var aSelectedData = oModelControl.getProperty("/MultiCombo/Depots")
                    var iData = -1;
                    var aDataFinal = [];
                    for (var x of aSelectedData) {
                        iData = aExistingData.findIndex(item => item["DepotId"] === x["Id"])
                        if (iData >= 0) {
                            //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                            aDataFinal.push(aExistingData[iData]);
                        } else {
                            aExistingData[0]["DepotId"] = x["Id"];
                            aDataFinal.push(aExistingData[0])
                        }
                    }
                    oPayload["Positions"] = aDataFinal;
                    //Service Pincode
                    if (oPayload["Positions"][0].hasOwnProperty("ServicePincodes")) {
                        var aExistingData = oPayload["Positions"][0]["ServicePincodes"]["results"];
                    } else {
                        var aExistingData = []
                    }
                    var aSelectedData = oModelControl.getProperty("/MultiCombo/Pincode2")
                    var iData = -1;
                    var aDataFinal = [];
                    for (var x of aSelectedData) {
                        iData = aExistingData.findIndex(item => item["PincodeId"] === x["Id"])
                        if (iData >= 0) {
                            //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                            aDataFinal.push(aExistingData[iData]);
                        } else {
                            aDataFinal.push({ PincodeId: x["Id"] });
                        }
                    }
                    oPayload["Positions"][0]["ServicePincodes"] = aDataFinal;
                    // child towns
                    if (oPayload["Positions"][0].hasOwnProperty("ChildTowns")) {
                        var aExistingData = oPayload["Positions"][0]["ChildTowns"]["results"];
                    } else {
                        var aExistingData = []
                    }
                    var aSelectedData = oModelControl.getProperty("/MultiCombo/ChildTowns")
                    var iData = -1;
                    var aDataFinal = [];
                    for (var x of aSelectedData) {
                        iData = aExistingData.findIndex(item => item["WorkLocationId"] === x["Id"])
                        if (iData >= 0) {
                            //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                            aDataFinal.push(aExistingData[iData]);
                        } else {
                            aDataFinal.push({ WorkLocationId: x["Id"] });
                        }
                    }
                    oPayload["Positions"][0]["ChildTowns"] = aDataFinal;
                    promise.resolve(oPayload);
                    return promise

                },

                _UpdatedObject: function (oPayLoad) {
                    var othat = this;
                    var oView = this.getView();
                    console.log(oPayLoad);
                    var oDataModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl");
                    var sProp = oModelControl.getProperty("/bindProp")
                    return new Promise((resolve, reject) => {

                        oDataModel.update("/" + sProp, oPayLoad, {
                            success: function (data) {
                                MessageToast.show(othat._geti18nText("Message1"));
                                resolve(data);
                            },
                            error: function (data) {

                                oModelControl.setProperty("/PageBusy", false);
                                reject(data);
                            },
                        });
                    });
                },
                onListItemPressLeads: function (oEvent) {
                    var oBj = oEvent.getSource().getBindingContext().getObject();
                    this.Navigate({
                        target: {
                            semanticObject: "Manage",
                            action: "Leads",
                            params: {
                                LeadId: oBj["Id"]
                            }
                        }
                    });
                },
                Navigate: function (oSemAct) {
                    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                        var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                        oCrossAppNav.toExternal({
                            target: {
                                semanticObject: oSemAct.target.semanticObject,
                                action: oSemAct.target.action
                            },
                            params: oSemAct.target.params
                        })
                    }
                },



            }

            );
        }
    );