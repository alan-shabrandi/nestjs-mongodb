import { Document, Model } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  fields?: string;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export async function paginate<T extends Document>(
  model: Model<T>,
  filter: any = {},
  options: PaginationOptions = {},
): Promise<PaginationResult<T>> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'asc',
    fields,
  } = options;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const query = model
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder });

  if (fields) query.select(fields);

  const [items, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
