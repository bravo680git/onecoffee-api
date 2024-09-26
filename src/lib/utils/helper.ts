export const generateUUID = (cfg?: { hasPrefix?: boolean; round?: number }) => {
  let slug = '';
  for (let i = 1; i <= (cfg?.round ?? 1); i++) {
    slug += Math.random().toString(36).slice(2);
  }
  return (cfg?.hasPrefix !== false ? '-' : '') + slug;
};

export const generateSlug = (input: string) => {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') + generateUUID()
  );
};

export const paginator = async <
  M extends {
    findMany: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
  },
  Args extends Parameters<M['findMany']>[0],
>(
  model: M,
  args: Args,
  queryParams?: RequestQuery,
): Promise<
  | ReturnType<M['findMany']>
  | { meta: ApiResponseMetadata; data: ReturnType<M['findMany']> }
> => {
  const page = Number(queryParams?.page) || undefined;
  const limit = Number(queryParams?.limit) || undefined;
  if (!page || !limit) {
    return await model.findMany(args);
  }

  const countArgs = { ...args, where: { deletedAt: null } };
  delete countArgs['include'];
  const count = await model.count(countArgs);

  const skip = (page - 1) * limit;
  const data = await model.findMany({ ...args, skip, take: limit });
  return {
    meta: {
      current: page,
      size: limit,
      total: count,
    },
    data,
  };
};
