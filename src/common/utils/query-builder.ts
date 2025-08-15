import { Document, Model } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private filter: any = {};
  private sortObj: any = {};
  private skip = 0;
  private limit = 10;
  private fields?: string;

  constructor(model: Model<T>) {
    this.model = model;
  }

  filterBy(field: string, value: any): this {
    if (value !== undefined && value !== null) {
      this.filter[field] = value;
    }
    return this;
  }

  filterByIds(ids: string[]): this {
    if (ids?.length) this.filter._id = { $in: ids };
    return this;
  }

  search(fields: string[], keyword?: string): this {
    if (keyword) {
      this.filter.$or = fields.map((f) => ({
        [f]: { $regex: keyword, $options: 'i' },
      }));
    }
    return this;
  }

  excludeDeleted(includeDeleted = false): this {
    if (!includeDeleted) this.filter.isDeleted = { $ne: true };
    return this;
  }

  sort(sortBy: string = 'createdAt', order: 'asc' | 'desc' = 'asc'): this {
    this.sortObj[sortBy] = order === 'asc' ? 1 : -1;
    return this;
  }

  paginate({ page = 1, limit = 10 }: PaginationOptions): this {
    this.skip = (page - 1) * limit;
    this.limit = limit;
    return this;
  }

  select(fields: string): this {
    this.fields = fields;
    return this;
  }

  async exec(): Promise<{
    items: T[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = this.model
      .find(this.filter)
      .skip(this.skip)
      .limit(this.limit)
      .sort(this.sortObj);
    if (this.fields) query.select(this.fields);

    const [items, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(this.filter).exec(),
    ]);
    return {
      items,
      total,
      page: Math.floor(this.skip / this.limit) + 1,
      totalPages: Math.ceil(total / this.limit),
    };
  }
}
