import { Injectable, NotFoundException } from '@nestjs/common';
import { Child, ChildDocument} from './child.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChildDto, MultiSchemeDto, noId } from 'ottery-dto';
import { id } from 'ottery-dto';
import { DataService } from '../data/data.service';
import { PermsService } from '../roles/perms.service';
import { LocatableService } from '../locatable/locatable.service';

@Injectable()
export class ChildService {
    constructor(
        private permService: PermsService,
        private dataService: DataService,
        private locatableService: LocatableService,
        @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    ){}

    /**
     * Creates a new child and saves it to the database
     * @param createChildDto A DTO of the child class
     * @returns the new child object
     */
    async create(owner: MultiSchemeDto, createChildDto: CreateChildDto) {
        const child = new this.childModel(createChildDto);

        this.locatableService.stamp(child, noId, owner.id);

        //add data page so that we can store data associated with the child
        child.data = (await this.dataService.create({
            id: child._id,
            ref: Child.name,
        }))._id;

        await this.permService.addPermBetween(owner, {
            id: child._id,
            ref: Child.name,
            document: child,
        })

        return await child.save();
    }

    /**
     * Updates a given child
     * @param child the updated child information
     * @returns the updated database entry of the child
     */
    async update(child: Child) {
        // overwrite is false so only modified fields are updated
        const updated = await this.childModel.findByIdAndUpdate(child._id, child).setOptions({overwrite: false, new: true});
        if (!updated) {
            throw new NotFoundException();
        } else {
            return updated;
        }
    }

    /**
     * Find a child by an id
     * @param id the id to search for
     * @returns a child class
     */
    async findOneById(id: id) {
        const found = await this.childModel.findById(id);

        if (!found) {
            throw new NotFoundException();
        } else {
            return found;
        }
    }

    /**
     * Finds multiple children by multiple IDs
     * @param ids the ids to search for
     * @returns a list of child objects found
     */
    async findManyByIds(ids: id[]) {
        return await this.childModel.find({'_id': { $in: ids }});
    }

    /**
     * Only intended to be used in testing
     * @param id the ID of the child to delete
     */
    async deleteChild(id: id) {
        this.childModel.findByIdAndDelete(id);
    }
}