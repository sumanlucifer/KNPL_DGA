sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "../model/formatter",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/m/MessageToast",
        "sap/ui/model/Filter"
    ],
    function (BaseController, JSONModel, formatter, MessageBox, Fragment, MessageToast, Filter) {
        "use strict";
        return BaseController.extend("com.knpl.dga.feedbackform.controller.Worklist", {
            formatter: formatter,
            /**
             * Called when the worklist controller is instantiated.
             * @public
             */
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                var oQuestionOptionsModel = new JSONModel([]);
                this.getView().setModel(oQuestionOptionsModel, "QuestionOptionsModel");


                var startupParams;
                if (this.getOwnerComponent().getComponentData()) {
                    startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                }

                if (startupParams) {
                    if (startupParams.hasOwnProperty("DgaId")) {
                        if (startupParams["DgaId"].length > 0) {
                            this._onNavToDetails(startupParams["DgaId"][0]);
                        }
                    }
                }

                oRouter.getRoute("worklist").attachMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function () {
                var oLocalViewModel = new JSONModel({
                    SortDescending: false,
                    CurrentLocationText: "Questions",
                    SectionBreadcrumbsVisible: false,
                    InputControlTypeId: null,
                    VisibleSaveQueDetails: false,
                    VisiblePageFooter: false,
                    VisibleSaveFormButton: false,
                    VisibleCancelFormButton: false,
                    AddLeadsTypeForm: true,
                    AddLostsTypeForm: true
                });
                this.getView().setModel(oLocalViewModel, "LocalViewModel");
            },

            /**
             * Called when the Forms and Question List is updated.
             * Its used to set the table header text with count of table items
             */
            onQuestionFormListUpdated: function (oEvent) {
                var sTableID = oEvent.getSource().getId().split("worklist--")[1],
                    oBindingLength = this.getView().byId(sTableID).getBinding("items").getLength() > 0 ? this.getView().byId(sTableID).getBinding("items").getLength() : "0",
                    oHeader = oEvent.getSource().getHeaderToolbar().getContent()[0];
                if (sTableID.indexOf("Form") < 0) {
                    oHeader.setText(this.getResourceBundle().getText("QuestionsCount", oBindingLength));
                } else {
                    oHeader.setText(this.getResourceBundle().getText("FormsCount", oBindingLength));
                }
            },

            /**
             * Called when the Form's Question List is updated.
             * Its used to set the table header text with count of table items
             */
            onSelectedAvailableFormQuestionsUpdated: function (oEvent) {
                var sTableID = oEvent.getSource().getId().split("worklist--")[1],
                    oBindingLength = this.getView().byId(sTableID).getBinding("items").getLength() > 0 ? this.getView().byId(sTableID).getBinding("items").getLength() : "0",
                    oHeader = oEvent.getSource().getHeaderToolbar().getContent()[0];
                if (sTableID.indexOf("Available") < 0) {
                    oHeader.setText(this.getResourceBundle().getText("SelectedQuestionsCount", oBindingLength));
                } else {
                    oHeader.setText(this.getResourceBundle().getText("AvailableQuestionsCount", oBindingLength));
                }
            },

            /**
             * Called when the performs search action on Forms and Question tables
             * Its used to filter the table items according to search parameter
             */
            onQuestionFormsSearch: function (oEvent) {
                var aTableSearchFilters = [],
                    sTableID = oEvent.getSource().getParent().getParent().getId().split("worklist--")[1],
                    sQuery = oEvent.getParameter("query"),
                    sFilterProperty = null;

                if (sTableID.indexOf("Form") < 0) {
                    sFilterProperty = "Question";
                } else {
                    sFilterProperty = "Name";
                }

                if (sQuery && sQuery.length > 0) {
                    aTableSearchFilters = [new Filter({
                        path: sFilterProperty,
                        operator: "Contains",
                        value1: sQuery,
                        caseSensitive: false
                    })];
                }

                this.getView().byId(sTableID).getBinding("items").filter(aTableSearchFilters, "Application");
            },

            /**
            * Called when click on the Question's table Sort button.
            * Its used to sort the  question's table with Ascending and Descending orders
            */
            onSortQuestionsPress: function (oEvent) {
                var sTableID = oEvent.getSource().getParent().getParent().getId().split("worklist--")[1],
                    oTable = this.getView().byId(sTableID),
                    bSortDescending = this.getView().getModel("LocalViewModel").getProperty("/SortDescending");

                this.getView().getModel("LocalViewModel").setProperty("/SortDescending", !bSortDescending);
                oTable.getBinding("items").sort(new sap.ui.model.Sorter("UpdatedAt", !bSortDescending));
            },

            onFormTypeSelectionChange: function (oEvent) {
                var sID = oEvent.getSource().getSelectedKey(),
                    aLeadsTypeForms = this.getView().byId("idFormTable").getItems().filter(function (oItem) {
                        return oItem.getBindingContext().getProperty("FormTypeId") === "1";
                    }),
                    bAddLeadForm = aLeadsTypeForms.length > 0 ? false : true,
                    aLostsTypeForms = this.getView().byId("idFormTable").getItems().filter(function (oItem) {
                        return oItem.getBindingContext().getProperty("FormTypeId") === "2";
                    }),
                    bAddLostForm = aLostsTypeForms.length > 0 ? false : true;

                this.getView().getModel("LocalViewModel").setProperty("/AddLeadsTypeForm", bAddLeadForm);
                this.getView().getModel("LocalViewModel").setProperty("/AddLostsTypeForm", bAddLostForm);

                // if (sID === "1" && this.getView().getModel("LocalViewModel").getProperty("/AddLeadsTypeForm") === false) {
                //     MessageBox.error("Lead converted form type is already added.");
                //     oEvent.getSource().setSelectedKey("");
                // }
                // if (sID === "2" && this.getView().getModel("LocalViewModel").getProperty("/AddLostsTypeForm") === false) {
                //     MessageBox.error("Lead lost Form type is already added.");
                //     oEvent.getSource().setSelectedKey("");
                // }
            },

            /**
            * Called when user selects Control type from drop down.
            * Its used to set the selected control type in model property for future reference.
            */
            onControlInputTypeChange: function (oEvent) {
                // To remove all options, when user changes option control type
                sap.ui.getCore().byId("idScrollContainer").removeAllContent();

                this.getView().getModel("QuestionOptionsModel").setData();

                var sId = oEvent.getSource().getSelectedKey();
                this.getView().getModel("LocalViewModel").setProperty("/InputControlTypeId", sId);

                // Add 1st option value by default
                if (sap.ui.getCore().byId("idScrollContainer").getContent().length <= 0) {
                    this.onAddOptionPress();
                }
            },

            /**
             * Called when the clicks on the Add Question button
             * Its used to open the Add Question Dialog
             */
            onAddQuestionsPress: function () {
                this.getView().getModel("QuestionOptionsModel").setData([]);
                if (!this.oAddQuestionsDialog) {
                    Fragment.load({ type: "XML", controller: this, name: "com.knpl.dga.feedbackform.view.fragments.AddQuestions" }).then(function (oDialog) {
                        this.oAddQuestionsDialog = oDialog;
                        this.getView().addDependent(oDialog);
                        oDialog.open();
                    }.bind(this));
                } else {
                    this.oAddQuestionsDialog.open();
                }
            },

            /**
             * Called when the clicks on the Close button on Add Question Dialog
             * Its used to Close the Add question dialog
             */
            onCloseAddQuestions: function () {
                this.fnResetAddQuestionDialog();
                this.oAddQuestionsDialog.close();
            },

            /**
             * Called when the clicks on the Close button on Add Question Dialog
             * Its used to reset the fields values and remove content from the Add question dialog
             */
            fnResetAddQuestionDialog() {
                sap.ui.getCore().byId("idQuestionNameINP").setValue("");
                sap.ui.getCore().byId("idQuestionNameINP").setValueState("None");
                sap.ui.getCore().byId("idOptionControlCMB").setSelectedKey("");
                sap.ui.getCore().byId("idScrollContainer").removeAllContent();
            },

            onIcnTbarChange: function (oEvent) {
                this.onCancelFormPress();

                if (oEvent.getSource().getSelectedKey() === "1") {
                    this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", "Forms");
                } else {
                    this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", "Questions");
                }
            },

            onDisplayFormDetails: function (oEvent) {
                var sCurrentLocationText = oEvent.getSource().getBindingContext().getProperty("FormTypeId") === "1" ? "Lead Converted Form" : "Lead Lost Form";
                this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", sCurrentLocationText);
                this.getView().getModel("LocalViewModel").setProperty("/SectionBreadcrumbsVisible", true);
                this.getView().getModel("LocalViewModel").setProperty("/VisibleCancelFormButton", true);
                this.getView().getModel("LocalViewModel").setProperty("/VisiblePageFooter", true);
                this.getView().getModel("LocalViewModel").setProperty("/VisibleSaveFormButton", false);

                var sAction = "DISPLAY";
                this.fnSetFormsVisibility(sAction);

                this.getView().setBusy(true);
                var sPath = oEvent.getSource().getBindingContext().getPath();
                this.getView().getModel().read(sPath, {
                    urlParameters: {
                        $expand: "FormType, MasterFormQuestions/Question"
                    },
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var oFormDetailsModel = new JSONModel({
                            "Id": oData.Id,
                            "Name": oData.Name,
                            "FormTypeId": oData.FormTypeId,
                            "MasterFormQuestions": oData.MasterFormQuestions.results
                        });
                        this.getView().setModel(oFormDetailsModel, "FormDetailsModel");
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            /**
             * Called when the clicks on the Add Form Button
             */
            onAddFormPress: function (oEvent) {
                this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", "Create Form");
                this.getView().getModel("LocalViewModel").setProperty("/SectionBreadcrumbsVisible", true);

                var sAction = "ADD";
                this.fnSetFormsVisibility(sAction);
            },

            onSaveFormPress: function () {
                if (this.getView().byId("idEditFormBox").getVisible()) {
                    this.onSaveEditFormPress();
                } else {
                    this.onSaveCreateFormPress();
                }
            },

            /**
            * Called when the clicks on the Save Form button on Form
            * Its used to make a backend Create call and save the details about the newly added Form
            */
            onSaveCreateFormPress: function () {
                var oFormPayloadSuccess = this.fnValidateCreateForm();

                //Validation is Successful, so save the data to create a new form
                if (typeof (oFormPayloadSuccess) === "object") {
                    this.getView().setBusy(true);
                    this.getView().getModel().create("/Forms", oFormPayloadSuccess, {
                        success: function (oResponse) {
                            this.getView().setBusy(false);
                            var sSuccessMsg = this._geti18nText("FormCreateSuccess");
                            MessageToast.show(sSuccessMsg, {
                                width: "200px"
                            });
                            this.getView().getModel().refresh();
                            this.onCancelFormPress();
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                        }.bind(this)
                    });
                }
            },

            onEditFormPress: function (oEvent) {
                var sCurrentLocationText = oEvent.getSource().getBindingContext().getProperty("FormTypeId") === "1" ? "Lead Converted Form" : "Lead Lost Form";

                this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", sCurrentLocationText);
                this.getView().getModel("LocalViewModel").setProperty("/SectionBreadcrumbsVisible", true);
                this.getView().getModel("LocalViewModel").setProperty("/VisibleCancelFormButton", true);
                this.getView().getModel("LocalViewModel").setProperty("/VisiblePageFooter", true);
                this.getView().getModel("LocalViewModel").setProperty("/VisibleSaveFormButton", true);

                var sAction = "EDIT";
                this.fnSetFormsVisibility(sAction);

                // Get the details about selected Form to be edit in JSON Model
                this.getView().setBusy(true);
                var sPath = oEvent.getSource().getParent().getParent().getBindingContext().getPath();
                this.getView().getModel().read(sPath, {
                    urlParameters: {
                        $expand: "FormType, MasterFormQuestions/Question"
                    },
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var oFormDetailsModel = new JSONModel({
                            "Id": oData.Id,
                            "Name": oData.Name,
                            "FormTypeId": oData.FormTypeId,
                            "MasterFormQuestions": oData.MasterFormQuestions.results
                        });
                        this.getView().setModel(oFormDetailsModel, "FormDetailsModel");

                        // Set visibility of available questions
                        this.fnSetAvailableQueTable();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            onSaveEditFormPress: function () {
                var oPayloadObj = this.fnGetFormPayloadObj();

                this.getView().setBusy(true);
                var sPath = "/Forms(" + oPayloadObj.Id + ")";
                this.getView().getModel().update(sPath, oPayloadObj, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var sSuccessMsg = this._geti18nText("FormUpdateSuccess");
                        MessageToast.show(sSuccessMsg, {
                            width: "200px"
                        });
                        this.getView().getModel().refresh();
                        this.onCancelFormPress();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            fnGetFormPayloadObj: function () {
                var oFMQuestionsTableItems = this.getView().byId("idEditFMQuestionsTBL").getSelectedItems(),
                    oFMAvailableQuestionsTableItems = this.getView().byId("idEditFMAvailableQuestionsTBL").getSelectedItems(),
                    aAllSelectedQuestion = [],
                    oPayloadObj = {};

                for (var i = 0; i < oFMQuestionsTableItems.length; i++) {
                    aAllSelectedQuestion.push({
                        QuestionId: oFMQuestionsTableItems[i].getBindingContext("FormDetailsModel").getProperty("QuestionId")
                    });
                }

                for (var j = 0; j < oFMAvailableQuestionsTableItems.length; j++) {
                    aAllSelectedQuestion.push({
                        QuestionId: oFMAvailableQuestionsTableItems[j].getBindingContext().getProperty("Id")
                    });
                }

                var aUniqueSelectedQuestion = [];
                aAllSelectedQuestion.filter(function (item) {
                    var i = aUniqueSelectedQuestion.findIndex(x => x.QuestionId === item.QuestionId);
                    if (i <= -1) {
                        aUniqueSelectedQuestion.push(item);
                    }
                    return null;
                });

                return oPayloadObj = {
                    "Id": this.getView().getModel("FormDetailsModel").getProperty("/Id"),
                    "Name": this.getView().getModel("FormDetailsModel").getProperty("/Name"),
                    "FormTypeId": this.getView().getModel("FormDetailsModel").getProperty("/FormTypeId"),
                    "MasterFormQuestions": aUniqueSelectedQuestion
                };
            },

            fnResetCreateFormDialog: function () {
                this.getView().byId("idCreateFormNameINP").setValue("");
                this.getView().byId("idCreateFormTypeCMB").setSelectedKey(null);
                this.getView().byId("idCreateFMQuestionsTBL").removeSelections();
            },

            onPublishFormPress: function (oEvent) {
                this.getView().setBusy(true);
                var sPath = oEvent.getSource().getParent().getParent().getBindingContext().getPath(),
                    sFormObj = oEvent.getSource().getParent().getParent().getBindingContext().getObject(),
                    aQuestions = [],
                    aQuestionsLists = sFormObj.MasterFormQuestions.__list;

                if (aQuestionsLists.length > 0) {
                    for (var i = 0; i < aQuestionsLists.length; i++) {
                        aQuestions.push({
                            "QuestionId": this.getView().getModel().getProperty("/" + aQuestionsLists[i]).QuestionId
                        });
                    }
                }

                var oPublishFormobj = {
                    "Id": sFormObj.Id,
                    "Name": sFormObj.Name,
                    "FormTypeId": sFormObj.FormTypeId,
                    "IsPublished": true,
                    "PublishDate": new Date(),
                    "MasterFormQuestions": aQuestions
                };

                this.getView().getModel().update(sPath, oPublishFormobj, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var sSuccessMsg = this._geti18nText("FormPublishSuccess");
                        MessageToast.show(sSuccessMsg, {
                            width: "200px"
                        });
                        this.getView().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            /**
            * Called when the the Save Form button is pressed
            * Its used to validate the required fields on the Form
            * If validation fails, it highlights respective fields
            * If validation ok, Returns the object used to create record.
            */
            fnValidateCreateForm: function () {
                var oCreateFormNameINP = this.getView().byId("idCreateFormNameINP"),
                    oCreateFormTypeCMB = this.getView().byId("idCreateFormTypeCMB"),
                    oCreateFormQuestionsTBL = this.getView().byId("idCreateFMQuestionsTBL");

                // Validate whether Form Name is given or not
                if (oCreateFormNameINP.getValue().trim().length < 1) {
                    var sErrorStateMsg = this._geti18nText("EnterValidFormName");
                    oCreateFormNameINP.setValueState("Error");
                    oCreateFormNameINP.setValueStateText(sErrorStateMsg);
                    return false;
                } else {
                    oCreateFormNameINP.setValueState("None");
                }

                // Validate whether Form Type is selected or not
                if (!oCreateFormTypeCMB.getSelectedKey()) {
                    var sErrorStateMsg = this._geti18nText("PleaseSelectFormType");
                    oCreateFormTypeCMB.setValueState("Error");
                    oCreateFormTypeCMB.setValueStateText(sErrorStateMsg);
                    return false;
                } else {
                    oCreateFormTypeCMB.setValueState("None");
                }

                // Validate whether at least 1 question is selected from table or not
                if (oCreateFormQuestionsTBL.getSelectedItems().length < 1) {
                    var sSelectQuestionsMsg = this._geti18nText("SelectQuestions");
                    MessageToast.show(sSelectQuestionsMsg, {
                        width: "200px"
                    });
                    return false;
                }

                var aSelectedItems = oCreateFormQuestionsTBL.getSelectedItems(),
                    aFormQuestions = [];

                for (var i = 0; i < aSelectedItems.length; i++) {
                    aFormQuestions.push({
                        "QuestionId": aSelectedItems[i].getBindingContext().getProperty("Id")
                    });
                }

                var oFormPayload = {
                    "Name": oCreateFormNameINP.getValue().trim(),
                    "FormTypeId": oCreateFormTypeCMB.getSelectedKey(),
                    "MasterFormQuestions": aFormQuestions
                };

                return oFormPayload;
            },

            /**
             * Called when the clicks on the Cancel button on Form
             * Its used to reset the Form and cancel the Add form view
             */
            onCancelFormPress: function (oEvent) {
                this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", "Forms");
                this.getView().getModel("LocalViewModel").setProperty("/SectionBreadcrumbsVisible", false);

                if (this.getView().byId("idCreateFormBox").getVisible()) {
                    this.fnResetCreateFormDialog();
                }
                if (this.getView().byId("idEditFormBox").getVisible()) {
                    this.getView().byId("idEditFMAvailableQuestionsTBL").removeSelections();
                }
                var sAction = "CANCEL";
                this.fnSetFormsVisibility(sAction);
            },

            /**
            * Called when the clicks on the Cancel button on Form
            * Its used to reset the Visibility of form contents
            */
            fnSetFormsVisibility: function (sAction) {
                switch (sAction) {
                    case "ADD":
                        this.getView().byId("idFormTable").setVisible(false);
                        this.getView().byId("idCreateFormBox").setVisible(true);
                        this.getView().byId("idDisplayFormBox").setVisible(false);
                        this.getView().byId("idEditFormBox").setVisible(false);

                        this.getView().getModel("LocalViewModel").setProperty("/VisibleCancelFormButton", true);
                        this.getView().getModel("LocalViewModel").setProperty("/VisiblePageFooter", true);
                        this.getView().getModel("LocalViewModel").setProperty("/VisibleSaveFormButton", true);
                        break;

                    case "CANCEL":
                        this.getView().byId("idFormTable").setVisible(true);
                        this.getView().byId("idCreateFormBox").setVisible(false);
                        this.getView().byId("idEditFormBox").setVisible(false);
                        this.getView().byId("idDisplayFormBox").setVisible(false);

                        this.getView().getModel("LocalViewModel").setProperty("/VisibleCancelFormButton", false);
                        this.getView().getModel("LocalViewModel").setProperty("/VisiblePageFooter", false);
                        this.getView().getModel("LocalViewModel").setProperty("/VisibleSaveFormButton", false);
                        break;

                    case "EDIT":
                        this.getView().byId("idFormTable").setVisible(false);
                        this.getView().byId("idCreateFormBox").setVisible(false);
                        this.getView().byId("idEditFormBox").setVisible(true);
                        this.getView().byId("idDisplayFormBox").setVisible(false);
                        break;

                    case "DISPLAY":
                        this.getView().byId("idFormTable").setVisible(false);
                        this.getView().byId("idCreateFormBox").setVisible(false);
                        this.getView().byId("idEditFormBox").setVisible(false);
                        this.getView().byId("idDisplayFormBox").setVisible(true);
                        break;
                }
            },

            /**
             * Called when the clicks on View Details button on the question list item
             * Its used to open the question details dialog and bind details of selected question.
             */
            onViewQuestionDetailsPress: function (oEvent) {
                this.fnGetQuestionDetails(oEvent);

                if (!this.oQuestionDetailsDialog) {
                    Fragment.load({ type: "XML", controller: this, name: "com.knpl.dga.feedbackform.view.fragments.QuestionDetails" }).then(function (oDialog) {
                        this.oQuestionDetailsDialog = oDialog;
                        this.getView().addDependent(oDialog);
                        oDialog.open();
                    }.bind(this));
                } else {
                    this.oQuestionDetailsDialog.open();
                }
            },

            fnGetQuestionDetails: function (oEvent) {
                var sPath = null;
                if (oEvent.getSource().getBindingContext()) {
                    sPath = oEvent.getSource().getBindingContext().getPath();
                } else {
                    var sID = oEvent.getSource().getBindingContext("FormDetailsModel").getProperty("QuestionId");
                    sPath = "/Questions(" + sID + ")";
                }

                this.getView().setBusy(true);
                this.getView().getModel().read(sPath, {
                    urlParameters: {
                        $expand: "AnswerOptions/MasterInputControlTypes"
                    },
                    success: function (oResponse) {
                        this.getView().setBusy(false);
                        var oQuestionDetailModel = new JSONModel(oResponse);
                        this.getView().setModel(oQuestionDetailModel, "QuestionDetailModel");
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            onEditQueDetailsPress: function (oEvent) {
                this.getView().getModel("LocalViewModel").setProperty("/VisibleSaveQueDetails", true);
            },

            onSaveEditQueDetailsPress: function (oEvent) {
                var oPayloadObj = this.fnGetUpdatedQueDetailsPayload();
                this.getView().setBusy(true);
                var sPath = "/Questions(" + oPayloadObj.Id + ")";
                this.getView().getModel().update(sPath, oPayloadObj, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var sSuccessMsg = this._geti18nText("QuestionUpdateSuccess");
                        MessageToast.show(sSuccessMsg, {
                            width: "200px"
                        });
                        this.getView().getModel().refresh();
                        this.onCloseQuestionDetails();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            fnGetUpdatedQueDetailsPayload: function () {
                var oPayloadObj = this.getView().getModel("QuestionDetailModel").getData(),
                    aAnswerOptions = oPayloadObj.AnswerOptions.results;

                if (oPayloadObj.Question) {
                    for (var i = 0; i < aAnswerOptions.length; i++) {
                        if (aAnswerOptions[i].MasterInputControlTypes.Type === "Radio Button" || aAnswerOptions[i].MasterInputControlTypes.Type === "Check Box") {
                            if (aAnswerOptions[i].Answer)
                                aAnswerOptions[i].Answer = aAnswerOptions[i].Answer.toString();
                            else {
                                MessageToast.show(this._geti18nText("AddAnswersForQueation"));
                                return;
                            }
                        }
                    }
                } else {
                    MessageToast.show(this._geti18nText("EnterQuestion"));
                    return;
                }

                oPayloadObj = {
                    "Id": oPayloadObj.Id,
                    "Question": oPayloadObj.Question,
                    "AnswerOptions": aAnswerOptions,
                    "IsArchived": oPayloadObj.IsArchived,
                    "InputControlTypeId": aAnswerOptions[0].MasterInputControlTypes.Id
                };

                return oPayloadObj;
            },

            onQuestionChange: function (oEvent) {
                var sQuestion = oEvent.getSource().getValue();
                this.getView().getModel("QuestionDetailModel").setProperty("/Question", sQuestion);
            },

            /**
             * Called when the clicks on the Close button on add question screen.
             * Its used to close the add question dialog.
             */
            onCloseQuestionDetails: function () {
                this.getView().getModel("LocalViewModel").setProperty("/VisibleSaveQueDetails", false);
                this.oQuestionDetailsDialog.close();
            },

            /**
             * Called when the clicks on Archive button on the question list item
             * Its used to Show the confirmation message
             * If Archive is confirmed, then Archive the selected question item with backend remove call.
             */
            onArchiveTogglePress: function (oEvent) {
                var oToggleButton = oEvent.getSource(),
                    bIsArchived = true,
                    bIsPressed = false,
                    sArchiveToggleMessage = this._geti18nText("ArchiveConfirmationMsg");

                if (oToggleButton.getIcon() === "sap-icon://cause") {
                    bIsArchived = false;
                    bIsPressed = true;
                    sArchiveToggleMessage = this._geti18nText("UnArchiveConfirmationMsg");
                }

                var aAnswerOptions = [],
                    aAnswerOptionPaths = oEvent.getSource().getParent().getParent().getBindingContext().getProperty("AnswerOptions");
                if (aAnswerOptionPaths && aAnswerOptionPaths.length > 0) {
                    for (var i = 0; i < aAnswerOptionPaths.length; i++) {
                        var oObj = oEvent.getSource().getParent().getParent().getBindingContext().getProperty("/" + aAnswerOptionPaths[i]);
                        delete (oObj.__metadata);
                        delete (oObj.MasterInputControlTypes);
                        delete (oObj.Question);
                        aAnswerOptions.push(oObj);
                    }
                }

                var oArchivePayload = {
                    "Id": oEvent.getSource().getParent().getParent().getBindingContext().getProperty("Id"),
                    "IsArchived": bIsArchived,
                    "Question": oEvent.getSource().getParent().getParent().getBindingContext().getProperty("Question"),
                    "AnswerOptions": aAnswerOptions,
                };
                MessageBox.warning(sArchiveToggleMessage, {
                    icon: MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [MessageBox.Action.NO, MessageBox.Action.YES],
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            this.fnArchiveActions(oArchivePayload);
                        } else {
                            oToggleButton.setPressed(bIsPressed);
                        }
                    }.bind(this),
                    emphasizedAction: MessageBox.Action.YES,
                    initialFocus: MessageBox.Action.NO,
                });
            },

            fnArchiveActions: function (oArchivePayload) {
                this.getView().setBusy(true);
                var sPath = "/Questions(" + oArchivePayload.Id + ")",
                    bIsArchived = oArchivePayload.IsArchived;
                this.getView().getModel().update(sPath, oArchivePayload, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var sSuccessMsg = bIsArchived === true ? this._geti18nText("QuestionArchiveSuccess") : this._geti18nText("QuestionUnArchiveSuccess");
                        MessageToast.show(sSuccessMsg, {
                            width: "200px"
                        });
                        this.getView().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            /**
             * Called when the clicks on Delete button on the question list item
             * Its used to Show the confirmation message
             * If Delete is confirmed, then Delete the selected question item with backend remove call.
             */
            onDeletePress: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext().getPath(),
                    sDeleteMessage = this._geti18nText("DeleteQuestionConfirmationMsg");

                MessageBox.warning(sDeleteMessage, {
                    icon: MessageBox.Icon.WARNING,
                    title: "Warning",
                    actions: [MessageBox.Action.NO, MessageBox.Action.YES],
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            this.fnDeleteQuestionDetails(oEvent, sPath);
                        }
                    }.bind(this),
                    emphasizedAction: MessageBox.Action.YES,
                    initialFocus: MessageBox.Action.NO,
                });
            },

            fnDeleteQuestionDetails: function (oEvent, sPath) {
                this.getView().setBusy(true);
                this.getView().getModel().remove(sPath, {
                    success: function (oData) {
                        this.getView().setBusy(false);
                        var sSuccessMsg = this._geti18nText("QuestionDeleteSuccess");
                        MessageToast.show(sSuccessMsg, {
                            width: "200px"
                        });
                        this.getView().getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        if (oError.statusCode === 200 || oError.statusCode === 204) {
                            var sSuccessMsg = this._geti18nText("QuestionDeleteSuccess");
                            MessageToast.show(sSuccessMsg, {
                                width: "200px"
                            });
                            this.getView().getModel().refresh();
                        }
                    }.bind(this)
                });
            },

            /**
             * Called when the clicks on Add Option button on Add Question Dialog.
             * Its used to Create a control according to selected Control type.
             * Once control created, add the items into the scroll container.
             */
            onAddOptionPress: function () {
                var sSelectedControlType = sap.ui.getCore().byId("idOptionControlCMB").getValue(),
                    oScrollContainer = sap.ui.getCore().byId("idScrollContainer"),
                    oQuestionOptionsModel = this.getView().getModel("QuestionOptionsModel"),
                    sInputControlTypeId = this.getView().getModel("LocalViewModel").getProperty("/InputControlTypeId"),
                    oItems = oQuestionOptionsModel.getData() ? oQuestionOptionsModel.getData() : [],
                    oOptionControl = {},
                    aRowContent = [],
                    oRowItem = {},
                    oInput = new sap.m.Input({
                        width: "90%",
                        value: "",
                        maxLength: 100,
                        liveChange: function (oEvent) {
                            this.onAnswerOptionTextChange(oEvent);
                        }.bind(this)
                    }),
                    oDeleteBtn = new sap.m.Button({
                        icon: "sap-icon://delete",
                        type: "Transparent",
                        press: function (oEvent) {
                            this.fnDeleteOptionRow(oEvent);
                        }.bind(this)
                    });

                // validation for User to add only 1 Test Box or Rating Indicator option
                if ((sSelectedControlType === "Rating" || sSelectedControlType === "Text Box") && oScrollContainer.getContent().length > 0) {
                    return;
                }

                // Handle a control with selected control type
                if (sSelectedControlType) {
                    switch (sSelectedControlType) {
                        case "Radio Button":
                            oOptionControl = new sap.m.RadioButton();
                            oItems.push({
                                optionValue: "",
                                optionControlType: "Radio Button"
                            });
                            aRowContent = [oOptionControl, oInput, oDeleteBtn];
                            break;

                        case "Check Box":
                            oOptionControl = new sap.m.CheckBox();
                            oItems.push({
                                optionValue: "",
                                optionControlType: "Check Box"
                            });
                            aRowContent = [oOptionControl, oInput, oDeleteBtn];
                            break;

                        case "Rating":
                            oOptionControl = new sap.m.RatingIndicator({
                                iconSize: "32px",
                                editable: false
                            });
                            oItems.push({
                                optionValue: "",
                                optionControlType: "Rating"
                            });
                            aRowContent = [oOptionControl];
                            break;

                        case "Text Box":
                            oOptionControl = new sap.m.TextArea({
                                rows: 7,
                                cols: 130,
                                showExceededText: true,
                                maxLength: 300,
                                enabled: false,
                                valueLiveUpdate: true
                            }).addStyleClass("sapUiTinyMarginTop");

                            oItems.push({
                                optionValue: "",
                                optionControlType: "Text Box"
                            });
                            aRowContent = [oOptionControl];
                            break;
                    }

                    // if Selected control type is other than Text Area, add 3 controls i.e(Control, Input and Delete button)
                    // else add only Text Area and delete Button
                    if (sSelectedControlType !== "Text Box") {
                        oRowItem = new sap.m.Toolbar({
                            style: "Clear",
                            content: aRowContent
                        }).addStyleClass("sapUiTinyMarginBottom");
                    } else {
                        oDeleteBtn.addStyleClass("sapUiMediumMarginTop")
                        oRowItem = new sap.m.HBox({
                            items: [oOptionControl]
                        }).addStyleClass("sapUiTinyMarginBottom");
                    }

                    oQuestionOptionsModel.setData(oItems);
                    this.getView().getModel("LocalViewModel").setProperty("/InputControlTypeId", sInputControlTypeId);
                    oScrollContainer.setModel(oQuestionOptionsModel);
                    oScrollContainer.addContent(oRowItem);
                }
                else {
                    var sMsg = this._geti18nText("SelectOptionControlType");
                    MessageToast.show(sMsg, {
                        width: "300px"
                    });
                }
            },

            /**
             * Called when the clicks on Delete button on the newly added options item.
             * Its used to destroy the selected option from the options list.
             */
            fnDeleteOptionRow: function (oEvent) {
                var rowItemContainer = oEvent.getSource().getParent();
                rowItemContainer.destroy();
            },

            /**
             * Called when the clicks on Save Question button on Add question Dialog.
             * If validation is ok, It saves the details of newly added question with backend Create call.
             */
            onSaveNewAddedQuestion: function (oEvent) {
                // Validate the mandatory fields and get payload if validation is successful.
                var oPayloadObj = this.fnValidateAndGetPayloadObj();

                // Save data to backend
                if (typeof (oPayloadObj) === "object") {
                    this.getView().setBusy(true);
                    this.getView().getModel().create("/Questions", oPayloadObj, {
                        success: function (oResponse) {
                            this.getView().setBusy(false);
                            this.onCloseAddQuestions();
                            var sSuccessMsg = this._geti18nText("QuestionCreateSuccess");
                            MessageToast.show(sSuccessMsg, {
                                width: "200px"
                            });
                            this.getView().getModel().refresh();
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                        }.bind(this)
                    });
                }
            },

            onQuestionTextChange: function (oEvent) {
                if (oEvent.getSource().getValue().length <= 0) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(this._geti18nText("EnterQuestion"));
                } else {
                    oEvent.getSource().setValueState("None");
                }
            },

            onAnswerOptionTextChange: function (oEvent) {
                if (oEvent.getSource().getValue().length <= 0) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(this._geti18nText("EnterValidAnswerORDeleteOption"));
                } else {
                    oEvent.getSource().setValueState("None");
                }
            },

            /**
            * Called when the validation started for newly added question.
            * If validation Fais: It gives error for respective fields on screen.
            * If Validation Successful: It returns the payload object to be used while backend create call.
            */
            fnValidateAndGetPayloadObj: function () {
                // Validate Question field value
                var oQuestion = sap.ui.getCore().byId("idQuestionNameINP");
                if (oQuestion.getValue().trim().length < 1) {
                    var sErrorStateMsg = this._geti18nText("EnterQuestion");
                    oQuestion.setValueState("Error");
                    oQuestion.setValueStateText(sErrorStateMsg);
                    return false;
                }
                oQuestion.setValueState("None");

                // Validate All Option Input control Type
                var sInputControlTypeId = this.getView().getModel("LocalViewModel").getProperty("/InputControlTypeId");

                // Validate All options Answers value
                var aOptionAnswers = [],
                    aOptionItems = sap.ui.getCore().byId("idScrollContainer").getContent();
                for (var i = 0; i < aOptionItems.length; i++) {
                    var aOption = aOptionItems[i].mProperties.hasOwnProperty("style") === true ? aOptionItems[i].getContent() : aOptionItems[i].getItems();
                    if (aOption.length > 2) {
                        if (aOption[1].getValue().trim().length < 1) {
                            var sErrorStateMsg = this._geti18nText("EnterValidAnswerORDeleteOption");
                            aOption[1].setValueState("Error");
                            aOption[1].setValueStateText(sErrorStateMsg);
                            return false;
                        } else {
                            aOption[1].setValueState("None");
                            aOptionAnswers.push({
                                InputControlTypeId: sInputControlTypeId,
                                Answer: aOption[1].getValue().trim()
                            });
                        }
                    } else {
                        aOptionAnswers.push({
                            InputControlTypeId: sInputControlTypeId,
                            Answer: ""
                        });
                    }
                }

                if (aOptionAnswers.length < 1) {
                    var sMsg = this._geti18nText("AddAnswersForQueation");
                    MessageToast.show(sMsg, {
                        width: "200px"
                    });
                    return;
                }

                var oPayload = {
                    "Question": oQuestion.getValue().trim(),
                    "AnswerOptions": aOptionAnswers,
                    "InputControlTypeId": aOptionAnswers[0].sInputControlTypeId
                };

                return oPayload;
            },

            onNavToFeedbackForm: function () {
                this.getView().byId("iconTabBar").setSelectedKey("0");
                this.getView().getModel("LocalViewModel").setProperty("/CurrentLocationText", "Questions");
                this.getView().getModel("LocalViewModel").setProperty("/SectionBreadcrumbsVisible", false);
                this.getView().getModel("LocalViewModel").setProperty("/VisiblePageFooter", false);
            },

            onNavToFormsTab: function () {
                this.onCancelFormPress();
            },

            fnSetAvailableQueTable: function () {
                var oTable = this.getView().byId("idEditFMAvailableQuestionsTBL"),
                    oSorter = new sap.ui.model.Sorter("UpdatedAt", true);
                oTable.bindAggregation("items", "/Questions", function (sId, oContext) {
                    var aSelectedQuestion = this.getView().getModel("FormDetailsModel").getProperty("/MasterFormQuestions"),
                        sQuestion = oContext.getProperty("Question"),
                        bSetQuestionVisible = aSelectedQuestion.findIndex(function (oItem) {
                            return oItem.QuestionId === oContext.getProperty("Id")
                        }) >= 0 ? false : true;

                    return new sap.m.ColumnListItem(sId, {
                        // selected: !bSetQuestionVisible,
                        visible: bSetQuestionVisible,
                        cells: [
                            new sap.m.Text({
                                text: sQuestion
                            }),
                            new sap.m.Button({
                                icon: "sap-icon://detail-view",
                                press: function (oEvent) {
                                    this.onViewQuestionDetailsPress(oEvent);
                                }.bind(this),
                                type: "Transparent",
                                tooltip: "View"
                            })
                        ]
                    });
                }.bind(this), oSorter)
            }
        });
    });