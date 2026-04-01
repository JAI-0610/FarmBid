import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'farmbid-ssi-secret-key-2025'
const TOKEN_EXPIRY = '7d'

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      did: user.did // Decentralized Identifier for SSI
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Generate DID (Decentralized Identifier) for SSI
export function generateDID(userId, role) {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `did:farmbid:${role}:${userId.substring(0, 8)}:${timestamp}${random}`
}

// Generate Verifiable Credential for SSI
export function generateVerifiableCredential(user, credentialType) {
  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://farmbid.io/credentials/v1'],
    type: ['VerifiableCredential', credentialType],
    issuer: 'did:farmbid:platform:issuer',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: user.did,
      name: user.name,
      role: user.role,
      trustScore: user.trustScore || 100,
      verified: user.verified || false
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: 'did:farmbid:platform:issuer#key-1',
      // In production, this would be an actual cryptographic signature
      proofValue: Buffer.from(JSON.stringify({
        userId: user.id,
        timestamp: Date.now()
      })).toString('base64')
    }
  }
  return credential
}
