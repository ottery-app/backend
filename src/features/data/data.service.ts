import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DataFieldDto, id, MultiSchemeDto } from "ottery-dto";
import { Data, DataDocument } from "./data.schema";
import { FormFieldService } from "../form/formField.service";
import { FormField } from "../form/formField.schema";

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class DataService {
    constructor(
        private formFieldService: FormFieldService,
        @InjectModel(Data.name) private dataModel: Model<DataDocument>,
    ) {}

    /**
     * this is used to create a data page
     */
    async create(owner: MultiSchemeDto, data?: DataFieldDto[]) {
        return await this.dataModel.create({
            owner: owner,
            data: data,
        });
    }

    /**
     * this is used to add data to a document by using the id of the document
     * @param {id} dataPageId the id of the doc to add to 
     * @param {DataFieldDto[]} dataField the data being added to the doc
     */
    async setDataById(dataPageId:id, dataField:DataFieldDto[]) {
        const page = await this.getDataDocumentById(dataPageId);
        this.setData(page, dataField);
    }

    /**
     * this is used to add data to a document by using the id of the owner of the document
     * @param ownerId the id of the person who owns the doc
     * @param dataField the fields to add to the data
     */
    async setDataByOwner(ownerId:id, dataField:DataFieldDto[]) {
        const page = await this.getDataDocumentByOwner(ownerId);
        this.setData(page, dataField);
    }

    /**
     * this can be used to add or update new data to the dataPage which is getting pased in.
     * It checks if there is a coresponding dataField with a matching formField.
     * @param {DataDocument} dataPage the page being updated
     * @param {DataFieldDto[]} dataFields the data being added
     */
    async setData(dataPage: DataDocument, dataFields: DataFieldDto[]) {
        for (let i = 0; i < dataFields.length; i++) {
            let added = false;

            const dataField = dataFields[i];
            for (let j = 0 ; j < dataPage.data.length; j++) {
                if (dataPage.data[j].formField === dataField.formField) {
                    dataPage.data[j] = dataField;
                    added = true;
                }
            }

            if (!added) {
                dataPage.data.push(dataField);
            }
        }
        await dataPage.save();
    }

    /**
     * used to get a data page by and id
     * @param {id} dataPageId the id of the data page that you are getting
     * @returns {DataDocument} the data page
     */
    async getDataDocumentById(dataPageId:id) {
        return await this.dataModel.findById(dataPageId);
    }

    /**
     * used to get a data page by the owners id
     * @param {id} ownerId the id of the owner that you are getting data for
     * @returns {DataDocument} the data page
     */
    async getDataDocumentByOwner(ownerId:id) {
        return await this.dataModel.findOne({
            'owner.id':ObjectId(ownerId)
        });
    }

    /**
     * this is used to get the data that is missing from the dataDocument.
     * It is primarily to save api time for when the user does not have info missing
     * @param {id} dataPageId the id of the user that should be checked
     * @param {id[]} desired the desired FormFields that the user should have corresponding data to
     * @returns the missing data fields that the user is lacking
     */
    async findMissingDataForId(dataPageId: id, desired: id[]) {
        const doc = await this.getDataDocumentById(dataPageId);
        return await this.findMissingDataFor(doc, desired);
    }

    /**
     * this is used to get the data that is missing from the owner of the data document.
     * It is primarily to save api time for when the user does not have info missing
     * @param {id} ownerId the id of the user that should be checked
     * @param {id[]} desired the desired FormFields that the user should have corresponding data to
     * @returns the missing data fields that the user is lacking
     */
    async findMissingDataForOwner(ownerId: id, desired: id[]) {
        const doc = await this.getDataDocumentByOwner(ownerId);
        return await this.findMissingDataFor(doc, desired);
    }

    /**
     * this is sued to find the info that is missing that is expected in the desired array. It checks the passed in dataPage and
     * returns the missing aspects
     * @param {DataDocument} dataPage the page to be reviewed
     * @param {id[]} desired the desired data ids 
     * @returns 
     */
    async findMissingDataFor(dataPage: DataDocument, desired: id[]) {
        const missing = desired.filter((id)=>{
            return dataPage.data.filter((data)=>data.formField == id).length === 0;
        });

        const ret = await this.formFieldService.findManyByIds(missing);
        return ret;
    }
}
