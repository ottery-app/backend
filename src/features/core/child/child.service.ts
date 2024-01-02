import { Injectable, NotFoundException } from '@nestjs/common';
import { Child, ChildDocument } from './child.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { noId } from '@ottery/ottery-dto';
import { id } from '@ottery/ottery-dto';
import { CrudService } from 'src/features/interfaces/crud.service.inerface';
import { CreateChild } from './CreateChild';
import { ImageFileService } from 'src/features/images/imageFile.service';

@Injectable()
export class ChildService implements CrudService {
  constructor(
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    private readonly imageService: ImageFileService,
  ) {}

  /**
   * Creates a new child and saves it to the database
   * @param createChildDto A DTO of the child class
   * @returns the new child object
   */
  async create(createChildDto: CreateChild) {
    //make sure the primary guardian is in the dto

    createChildDto.pfp.src = (
      await this.imageService.uploadPublicFile(createChildDto.pfp.src)
    ).url;

    const child = new this.childModel({
      ...createChildDto,
      guardians: [createChildDto.primaryGuardian],
      events: [],
      //SHOULD PROBABLY USE THE SERVICE BUT IT NEEDS TO BE CALLED BEFORE THE MODULE IS MADE
      lastStampedLocation: {
        at: noId,
        with: createChildDto.primaryGuardian,
        time: new Date().getTime(),
      },
    });

    return await child.save();
  }

  async addGuardians(childId: id, ids: id[]) {
    const child = await this.get(childId);
    child.guardians.push(...ids.filter((id) => !child.guardians.includes(id)));
    return await child.save();
  }

  /**
   * Updates a given child
   * @param child the updated child information
   * @returns the updated database entry of the child
   */
  async update(childId: id, child: Child) {
    // overwrite is false so only modified fields are updated
    const updated = await this.childModel
      .findByIdAndUpdate(childId, child)
      .setOptions({ overwrite: false, new: true });
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
  async get(id: id) {
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
  async getMany(ids: id[]) {
    return await this.childModel.find({ _id: { $in: ids } });
  }

  /**
   * Only intended to be used in testing
   * @param id the ID of the child to delete
   */
  async delete(id: id) {
    await this.childModel.findByIdAndDelete(id);
  }
}
