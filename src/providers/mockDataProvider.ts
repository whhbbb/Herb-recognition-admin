import { DataProvider } from "@refinedev/core";
import { herbDatabase } from "../data/herbDatabase"; // 复用你已有的数据

// 模拟内存中的数据状态
let localHerbs = [...herbDatabase];

export const mockDataProvider: DataProvider = {
    // 获取列表
    getList: async ({ resource }) => {
        if (resource === "herbs") {
            return {
                data: localHerbs as any,
                total: localHerbs.length,
            };
        }
        return { data: [], total: 0 };
    },
    // 获取单个详情
    getOne: async ({ resource, id }) => {
        const item = localHerbs.find((h) => h.id === id);
        return { data: item as any };
    },
    // 创建数据
    create: async ({ resource, variables }) => {
        const newHerb = { ...variables, id: Date.now().toString() };
        localHerbs.push(newHerb as any);
        return { data: newHerb as any };
    },
    // 更新数据
    update: async ({ resource, id, variables }) => {
        localHerbs = localHerbs.map((h) => (h.id === id ? { ...h, ...variables } : h));
        return { data: variables as any };
    },
    // 删除数据
    deleteOne: async ({ resource, id }) => {
        localHerbs = localHerbs.filter((h) => h.id !== id);
        return { data: {} as any };
    },
    // 其他必要方法可以先返回 empty
    getApiUrl: () => "",
};