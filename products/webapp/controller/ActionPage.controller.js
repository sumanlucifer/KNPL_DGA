sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "../model/formatter",
], function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageToast,
    MessageBox, PDFViewer, formatter) {
    "use strict";
    return BaseController.extend("com.knpl.dga.products.controller.ActionPage", {
        formatter: formatter,
        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.oPreviewImage = this.getView().byId("idPreviewImage");
            this.oPreviewPdf = this.getView().byId("idPreviewPdf");
            this.oFileUploader = this.getView().byId("idFormToolImgUploader");
            this.oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");
            this.pdfBtn = this.getView().byId("pdfBtn");
            this.imgBtn = this.getView().byId("imageBtn");
            this.oCategory = this.getView().byId("idCategory");
            this.oClassification = this.getView().byId("idClassification");
            this.oTitle = this.getView().byId("idTitle");
            this.oProduct = this.getView().byId("idInputProduct");
            this.oForm = this.getView().byId("idCatalogueDetailsForm");
            this.imageName = "";
            this.pdfName = "";
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("ActionPage").attachPatternMatched(this._onObjectMatched, this);
            this.entityObject;
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
        },
        _onObjectMatched: function (oEvent) {
            this._action = oEvent.getParameter("arguments").action;
            this._property = oEvent.getParameter("arguments").property;
           

            // this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_DS.uri;
            this.MainModel= this.getOwnerComponent().getModel();
            this.sServiceURI =  `${this.MainModel.sServiceUrl}/`;
           
            var oData = {
                busy: false,
                action: this._action,
                Title: "",
                Name: "",
                Category: "",
                Classification: "",
                Range: "",
                ImageUrl: "",
                Competitor: [],
                Catalogue: []
            };
            var oViewModel = new JSONModel(oData);
            this.getView().setModel(oViewModel, "ActionViewModel");
            if (this._action === "edit") {
                var oComponentModel = this.getComponentModel();
                var html = new sap.ui.core.HTML();
                //var oItem = oComponentModel.getProperty("/" + this._property);
                // this.oItem;
                var that = this;
                this.getView().getModel().read("/" + this._property, {
                    urlParameters: {
                        "$expand": "ProductCompetitors,MediaList"
                    },
                    success: function (data, response) {
                        that.entityObject = data;
                        oData.Title = data.ProductId;
                        oData.Name = data.Title;
                        oData.Category = data.ProductCategoryId
                        oData.Classification = data.ProductClassificationId
                        oData.Range = data.ProductRangeId
                        oData.Competitor = data.ProductCompetitors.results
                        oData.Catalogue = data.MediaList.results.filter(function (ele) {
                            return !ele.ContentType.includes("image");
                        });
                        oData.ImageUrl = that.sServiceURI + that._property + "/$value?doc_type=image&time=" + new Date().getTime();
                        var oViewModel = new JSONModel(oData);
                        that.getView().setModel(oViewModel, "ActionViewModel");
                        that.oPreviewImage.setSrc(that.sServiceURI + that._property + "/$value?doc_type=image");
                        that.oFileUploader.setUploadUrl(that.sServiceURI + that._property + "/$value?doc_type=image");
                        that.oPreviewImage.setVisible(false);
                        //that.getView().getModel("ActionViewModel").setProperty("/Image",that.sServiceURI + that._property + "/$value?doc_type=image");
                    },
                    error: function (oError) {
                    }
                });
                this.oCategory.setEditable(false);
                this.oTitle.setEditable(false);
                this.oTitle.setVisible(false);
                this.oClassification.setEditable(false);
                this.oProduct.setVisible(true);
                this.oProduct.setEditable(false);
                var pdfURL = this.sServiceURI + this._property + "/$value?doc_type=pdf";
                this.pdfBtn.setVisible(true);
                this.imgBtn.setVisible(true);
            } else {
                this.oCategory.setEditable(true);
                this.oTitle.setVisible(true);
                this.oTitle.setEditable(true);
                this.oClassification.setEditable(true);
                this.oProduct.setVisible(false);
                this.oPreviewImage.setVisible(false);
                this.pdfBtn.setVisible(false);
                this.imgBtn.setVisible(false);
            }
            this.oFileUploader.clear();
            var oViewModel = new JSONModel(oData);
            this.getView().setModel(oViewModel, "ActionViewModel");
            this._setDefaultValueState();
        },
        onAfterRendering: function () {
        },
        onPressBreadcrumbLink: function () {
            this._navToHome();
        },
        onPressCancel: function () {
            this._navToHome();
        },
        onChangeFile: function (oEvent) {
            if (oEvent.getSource().oFileUpload.files.length > 0) {
                this.getModel("ActionViewModel").setProperty("/bNewImage", true);
                this.imageName = this.oFileUploader.getValue();
                var file = oEvent.getSource().oFileUpload.files[0];
                var path = URL.createObjectURL(file);
                this.oPreviewImage.setSrc(path);
                this.oPreviewImage.setVisible(true);
            } else {
                this.getModel("ActionViewModel").setProperty("/bNewImage", false);
                if (this._action === "add") {
                    this.oPreviewImage.setSrc(path);
                    this.oPreviewImage.setVisible(false);
                } else {
                    this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value");
                }
            }
        },
        openPdf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ActionViewModel");
            var sSource = this.sServiceURI + this._property + "/$value?doc_type=pdf&file_name=" + oContext.getProperty("MediaName") + "&language_code=" + oContext.getProperty("LanguageCode");
            sap.m.URLHelper.redirect(sSource, true)
        },
        onChangePdf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ActionViewModel");
            if (oEvent.getParameter("files").length > 0) {
                var pdfname = oEvent.getParameter("files")[0].name;
                this.getModel("ActionViewModel").setProperty("file", oEvent.getParameter("files")[0], oContext);
                this.getModel("ActionViewModel").setProperty("fileName", oEvent.getParameter("newValue"), oContext);
                this.getModel("ActionViewModel").setProperty("bNew", true, oContext);
                var isValid = this.checkFileName(pdfname);
                if (!isValid) {
                    MessageBox.show("File names can't contain the following characters: &  ? < > # { } [] % ~ / \.");
                }
            }
        },
        _uploadToolImage: function (oData) {
            // oData.Id = 2;
            var oModel = this.getComponentModel();
            if (this._action === "add") {
                this.oFileUploader.setUploadUrl(this.sServiceURI + "ProductCatalogues(" + oData.Id + ")/$value?doc_type=image&file_name=" + this.imageName);
            }
            if (!this.oFileUploader.getValue()) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));
                return;
            }
            this.oFileUploader.checkFileReadable().then(function () {
                // @ts-ignore
                //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploader.setHttpRequestMethod("PUT");
                this.getView().getModel("ActionViewModel").setProperty("/busy", true);
                this.oFileUploader.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {
                this.oFileUploader.clear();
            }.bind(this));
        },
        _uploadPdf: function (oData) {
            var oModel = this.getComponentModel();
            if (this._action === "add") {
                var oModel = this.getModel("ActionViewModel");
                var catalogue = oModel.getProperty("/Catalogue");
                var fileUploader;
                var sServiceUri = this.sServiceURI;
                //To DO promises for sync
                // var that=this;
                catalogue.forEach(function (ele) {
                    //  var isValid= that.checkFileName(ele.fileName);
                    jQuery.ajax({
                        method: "PUT",
                        url: sServiceUri + "ProductCatalogues(" + oData.Id + ")/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: ele.file,
                        success: function (data) {
                        },
                        error: function () { },
                    })
                });
            }
        },
        //Update methods for pdf and Image
        _updateImage: function (propertySet) {
            if (this.getModel("ActionViewModel").getProperty("/bNewImage") == false) {
                return;
            }
            var oModel = this.getComponentModel();
            this.oFileUploader.setUploadUrl(this.sServiceURI + propertySet + "/$value?doc_type=image&file_name=" + this.imageName);
            this.oFileUploader.checkFileReadable().then(function () {
                // @ts-ignore
                //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploader.setHttpRequestMethod("PUT");
                // this.getView().getModel("ActionViewModel").setProperty("/busy", true);
                this.oFileUploader.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {
                this.oFileUploader.clear();
            }.bind(this));
        },
        _updatePdf: function (propertySet) {
            var oModel = this.getModel("ActionViewModel");
            var catalogue = oModel.getProperty("/Catalogue");
            var fileUploader;
            var sServiceUri = this.sServiceURI;
            catalogue.forEach(function (ele) {
                if (ele.bNew) {
                    jQuery.ajax({
                        method: "PUT",
                        url: sServiceUri + propertySet + "/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: ele.file,
                        success: function (data) {
                        },
                        error: function () { },
                    })
                }
            })
        },
        handleUploadComplete: function () {
            this._showSuccessMsg();
        },
        handleUploadCompleteImage: function () {
            this.idPreviewImage;
            this._showSuccessMsg();
        },
        handleUploadCompletePdf: function () {
            this._showSuccessMsg();
        },
        onPressSaveOrUpdate: function () {
            if (this._validateRequiredFields()) {
            var oDataModel = this.getComponentModel();
            var oViewModel = this.getView().getModel("ActionViewModel");
            var Competitors = JSON.parse(
                JSON.stringify(oViewModel.getProperty("/Competitor"))
            ).map((item) => {
                // var id = parseInt(item.CompetitorCompanyId);
                var id = item.CompetitorCompanyId;
                var name = item.CompetitorProductName;
                var list = { CompetitorCompanyId: id, CompetitorProductName: name }
                return list;
            });
            var oParam = {};
            $.extend(true, oParam, this.entityObject);
            //delete oParam.__metadata;
            delete oParam.MediaList;
            //OParams are used when update 
            oParam.Title = oViewModel.getProperty("/Name"),
                oParam.Description = oViewModel.getProperty("/Name"),
                oParam.ProductId = oViewModel.getProperty("/Title"),
                oParam.ProductCategoryId = oViewModel.getProperty("/Category"),
                oParam.ProductClassificationId = oViewModel.getProperty("/Classification"),
                // oParam.ProductRangeId = parseInt(oViewModel.getProperty("/Range"),
                oParam.ProductRangeId = oViewModel.getProperty("/Range"),
                oParam.ProductCompetitors = Competitors
            if (this._action !== "edit") {
                var Title = this.getView().byId("idTitle").getSelectedItem().getText();
                //oPayload are used when create 
                var oPayload = {
                    Title: Title,
                    Description: Title,
                    ProductId: this.getView().byId("idTitle").getSelectedItem().getKey(),
                    ProductCategoryId: oViewModel.getProperty("/Category"),
                    ProductClassificationId: oViewModel.getProperty("/Classification"),
                    // ProductRangeId: parseInt(oViewModel.getProperty("/Range")),
                    ProductRangeId: oViewModel.getProperty("/Range"),
                    ProductCompetitors: Competitors
                };
            }
            var cFiles = [];
            cFiles.push(this.oFileUploader.getValue());
            cFiles.push(this.oFileUploaderPdf.getValue());
            if (cFiles) {
                //oViewModel.setProperty("/busy", true);
                if (this._action === "add") {
                    if (!this.oFileUploader.getValue()) {
                        MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));
                    } else {
                        var that = this
                        oDataModel.create("/ProductCatalogues", oPayload, {
                            success: function (oData, response) {
                                var id = oData.Id;
                                that._uploadToolImage(oData);
                                that._uploadPdf(oData);
                                that.getOwnerComponent().getModel().refresh(true);
                            },
                            error: function (oError) {
                                console.log("Error!");
                            }
                        });
                    }
                } else {
                    var that = this;
                    var _property = this._property;
                    // console.log(oPayload);
                    oDataModel.update("/" + _property, oParam, {
                        success: function () {
                            that._showSuccessMsg();
                            that._updateImage(_property);
                            that._updatePdf(_property);
                            that.getOwnerComponent().getModel().refresh(true);
                        },
                        error: function (oError) {
                            console.log("Error!");
                        }
                    });
                }
            }
            }
        },
        _onLoadSuccess: function (oData) {
            if (this.oFileUploader.getValue()) {
                this._uploadToolImage(oData);
            } else {
                this._showSuccessMsg();
            }
        },
        _onLoadError: function (error) {
            var oViewModel = this.getView().getModel("ActionViewModel");
            oViewModel.setProperty("/busy", false);
            var oRespText = JSON.parse(error.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
        },
        _showSuccessMsg: function () {
            var oViewModel = this.getView().getModel("ActionViewModel");
            oViewModel.refresh(true);
            // oViewModel.setProperty("/busy", false);
            var sMessage = (this._action === "add") ? this.oResourceBundle.getText("messageToastCreateMsg") : this.oResourceBundle.getText("messageToastUpdateMsg");
            MessageToast.show(sMessage);
            this._navToHome();
        },
        onChangeValue: function (oEvent) {
            var oControl = oEvent.getSource();
            this._setControlValueState([oControl]);
        },
        onFileSizeExceed: function () {
            var sMessage = "Maximum file size exceeded!";
            MessageToast.show(sMessage);
        },
        _validateRequiredFields: function () {
            // var oTitleControl = this.getView().byId("idTitle");
            var oCategoryControl = this.getView().byId("idCategory");
            var oClassificationControl = this.getView().byId("idClassification");
            var oRangeControl = this.getView().byId("idRange");
            var oObjectCatalogue = this.getModel("ActionViewModel").getProperty("/Catalogue");
            var oObjectCompetitors = this.getModel("ActionViewModel").getProperty("/Competitor");
            var oSet = new Set();
            var bCataloguePDF = oObjectCatalogue.every(function (ele) {
                if (oSet.has(ele.LanguageCode) !== true) {
                    oSet.add(ele.LanguageCode);
                    return true
                }
                return false;
            });
            var bCompetitors = oObjectCompetitors.every(function (ele) {
                if (ele.CompetitorProductName == "" || ele.CompetitorProductName == null) {
                    return false;
                }
                return true;
            });
            var bEnglishPDF = oObjectCatalogue.find(function (ele) {
                if (ele.LanguageCode === "EN") {
                    return true;
                }
                return false;
            })
            // this._setControlValueState([oTitleControl]);
            this._setSelectControlValueState([oCategoryControl, oClassificationControl, oRangeControl]);
            if (oCategoryControl.getSelectedKey() &&
                oClassificationControl.getSelectedKey() && oRangeControl.getSelectedKey()) {
                if (!bEnglishPDF) {
                    var sMessage = "English PDF Required";
                    MessageToast.show(sMessage);
                    return false;
                }
                if (!bCataloguePDF) {
                    var sMessage = "Multiple PDF of same Language";
                    MessageToast.show(sMessage);
                    return false;
                }
                if (oObjectCatalogue.length > 0) {
                    if (oObjectCompetitors.length > 0) {
                        if (!bCompetitors) {
                            var sMessage = "Add Competitor Product Name!";
                            MessageToast.show(sMessage);
                            return false;
                        }
                        return true;
                    } else {
                        return true;
                    }
                }
                else {
                    var sMessage = "Upload English Catalogue";
                    MessageToast.show(sMessage);
                }
            } else {
                return false;
            }
        },
        _setDefaultValueState: function () {
            //var oTitleControl = this.getView().byId("idTitle");
            var oCategoryControl = this.getView().byId("idCategory");
            var oClassificationControl = this.getView().byId("idClassification");
            var oRangeControl = this.getView().byId("idRange");
            // oTitleControl.setValueState("None");
            // oTitleControl.setValueStateText("");
            oCategoryControl.setValueState("None");
            oCategoryControl.setValueStateText("");
            oClassificationControl.setValueState("None");
            oClassificationControl.setValueStateText("");
            oRangeControl.setValueState("None");
            oRangeControl.setValueStateText("");
        },
        _setControlValueState: function (aControl) {
            for (var i = 0; i < aControl.length; i++) {
                var oControl = aControl[i],
                    sValue = oControl.getValue();
                if (sValue) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                } else {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(this.oResourceBundle.getText("requiredValueText"));
                }
            }
        },
        _setSelectControlValueState: function (aControl) {
            for (var i = 0; i < aControl.length; i++) {
                var oControl = aControl[i],
                    sValue = oControl.getSelectedKey();
                if (sValue) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                } else {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(this.oResourceBundle.getText("requiredValueText"));
                }
            }
        },
        checkFileName: function (fileName) {
            var isValid = false;
            var regex = /[~`!@#$%^&()_={}[\]:;,<>+\/?-]/;
            isValid = regex.test(fileName);
            if (!isValid) {
                return true;
            }
            else {
                return false;
            }
        },
        onAddCompetitor: function () {
            var oModel = this.getView().getModel("ActionViewModel");
            var oCompetitorMdl = oModel.getProperty("/Competitor");
            var bFlag = true;
            oCompetitorMdl.push({
                CompetitorCompanyId: "",
                CompetitorProductName: ""
            });
            oModel.refresh(true);
        },
        onPressRemoveCompetitor: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("ActionViewModel");
            var sPath = oEvent
                .getSource()
                .getBindingContext("ActionViewModel")
                .getPath()
                .split("/");
            var aCompetitor = oModel.getProperty("/Competitor");
            aCompetitor.splice(parseInt(sPath[sPath.length - 1]), 1);
            //this._setFDLTbleFlag();
            oModel.refresh(true);
        },
        onAddCatalogue: function () {
            var oModel = this.getView().getModel("ActionViewModel");
            var oObject = this.getModel("ActionViewModel").getProperty("/Catalogue");
            oObject.push({
                LanguageCode: "EN",
                file: null,
                fileName: ""
            });
            oModel.refresh(true);
            // var pdfContainer = this.byId("idPdf");
            //  pdfContainer.getBinding("items").refresh(true);
            //oModel.setProperty("/Catalogue", oObject);
        },
        onDeleteFile: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("ActionViewModel");
            //oModel.setProperty("bNew", true);
            var sPath = oEvent
                .getSource()
                .getBindingContext("ActionViewModel")
                .getPath()
                .split("/");
            var aCatalogue = oModel.getProperty("/Catalogue");
            var othat = this;
            MessageBox.confirm(
                "Kindly confirm to delete the file.",
                {
                    actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction == "OK") {
                            othat.onPressRemoveCatalogue(sPath, aCatalogue);
                        }
                    },
                }
            );
        },
        onPressRemoveCatalogue: function (sPath, aCatalogue) {
            var that=this;
            var oView = this.getView();
            var oModel = oView.getModel("ActionViewModel");
            // var sPath = oEvent
            //     .getSource()
            //     .getBindingContext("ActionViewModel")
            //     .getPath()
            //     .split("/");
            // var aCatalogue = oModel.getProperty("/Catalogue");
            var index = parseInt(sPath[sPath.length - 1]);
            var delItems = [];
            var property = this._property;
            var sServiceUri = this.sServiceURI;
            // aCatalogue.splice(parseInt(sPath[sPath.length - 1]), 1);
            //To DO promises for sync
            for (var i = 0; i <= aCatalogue.length; i++) {
                if (i == index) {
                    delItems = aCatalogue[i];
                    if (delItems.MediaName != null) {
                        oModel.setProperty("/bBusy", true);
                        jQuery.ajax({
                            method: "DELETE",
                            url: sServiceUri + property + "/$value?doc_type=pdf&file_name=" + delItems.MediaName + "&language_code=" + delItems.LanguageCode,
                            cache: false,
                            contentType: false,
                            processData: false,
                            // data: delItems,
                            success: function (data) {
                                // aCatalogue.splice(i);
                                oModel.setProperty("/bBusy", false);
                                aCatalogue.splice(parseInt(sPath[sPath.length - 1]), 1);
                                var sMessage = "Catalogue Deleted!";
                                MessageToast.show(sMessage);
                                that.getOwnerComponent().getModel().refresh(true);
                                oModel.refresh(true);
                            },
                            error: function () { },
                        })
                    }
                    else {
                        aCatalogue.splice(i);
                    }
                }
            };
            oModel.refresh(true);
            this.getOwnerComponent().getModel().refresh(true);
        },
        onImageView: function (oEvent) {
            var oButton = oEvent.getSource();
            var oView = this.getView();
            if (!this._imageDialog) {
                Fragment.load({
                    name: "com.knpl.dga.products.view.fragments.ImagePopup",
                    controller: this,
                }).then(
                    function (oDialog) {
                        this._imageDialog = oDialog;
                        oView.addDependent(this._imageDialog);
                        this._imageDialog.open();
                    }.bind(this)
                );
            } else {
                oView.addDependent(this._imageDialog);
                this._imageDialog.open();
            }
        },
        onPressCloseDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        },
        onDialogClose: function (oEvent) {
            this._imageDialog.destroy();
            delete this._imageDialog;
        },
        onClassificationChange: function (oEvent) {
            var ClassificationId = oEvent.getParameter("selectedItem").getKey();
            var CategoryId = this.getView().byId("idCategory").getSelectedKey();
            // ClassificationId = "POP";
            // CategoryId = "CC";
            var Products = [];
            var that = this;
            this.getView().getModel().read("/CatalogueProducts", {
                urlParameters: {
                    // "CategoryCode": "'" + CategoryId + "'",
                    // "ClassificationCode": "'" + ClassificationId + "'"
                    "CategoryCode": `'${CategoryId}'`,
                    "ClassificationCode": `'${ClassificationId}'`
                },
                success: function (data, response) {
                    Products = data.results;
                    that.getView().getModel("ActionViewModel").setProperty("/CatalogueProducts", Products);
                },
                error: function (oError) {
                }
            });
        },
        onCategoryChange: function () {
            var classification = this.getView().byId("idClassification");
            classification.setSelectedItem(null);
            var product = this.getView().byId("idTitle");
            product.setSelectedItem(null);
        }
    });
});
