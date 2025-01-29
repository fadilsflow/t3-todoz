import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const todoRouter = createTRPCRouter({
    // Get all todos
    getAll: publicProcedure.query(async ({ ctx }) => {
      return ctx.db.todo.findMany({
        orderBy: {
            createdAt: 'desc',
        }
      });
    }),

    // create new todo

    create: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.todo.create({
            data: {
                title: input.title,
            }
        });
    }),

    // Toggle tod completion
    toggle: publicProcedure
    .input(z.object ({ id: z.string(), completed: z.boolean() }))
    .mutation( async ({ ctx, input }) =>  {
        return ctx.db.todo.update({
            where: {
                id: input.id,
            },
            data:{
                completed: input.completed
            }
        })
    }),

    // Delete todo
    delete: publicProcedure
    .input(z.object({ id: z.string () }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.todo.delete({
            where:{
                id: input.id
            }
        })

    })
}) 
