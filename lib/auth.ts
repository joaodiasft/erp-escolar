import { compare, hash } from 'bcryptjs'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function createUser(
  email: string,
  password: string,
  nome: string,
  role: Role,
  cpf?: string,
  telefone?: string
) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      nome,
      role,
      cpf,
      telefone,
    },
  })
}

export async function authenticateUser(
  email: string,
  password: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        aluno: true,
        professor: true,
        admin: true,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('User found:', user ? 'Yes' : 'No')
      if (user) {
        console.log('User status:', user.status)
      }
    }

    if (!user || user.status !== 'ATIVO') {
      return null
    }

    const isValid = await verifyPassword(password, user.password)

    if (process.env.NODE_ENV === 'development') {
      console.log('Password valid:', isValid)
    }

    if (!isValid) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  } catch (error) {
    console.error('Error in authenticateUser:', error)
    throw error
  }
}

export function hasPermission(userRole: Role, requiredRole: Role | Role[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(userRole)
}

export function isAdmin(role: Role): boolean {
  return role.startsWith('ADMIN_')
}

export function isProfessor(role: Role): boolean {
  return role === 'PROFESSOR'
}

export function isAluno(role: Role): boolean {
  return role === 'ALUNO'
}

