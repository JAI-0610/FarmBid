module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/api/[[...path]]/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/esm-node/v4.js [app-route] (ecmascript) <export default as v4>");
;
;
// ── CORS helper ──────────────────────────────────────────────────────
function cors(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}
async function OPTIONS() {
    return cors(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
        status: 200
    }));
}
// ── Demo user data ──────────────────────────────────────────────────
const demoUsers = {
    buyer: {
        id: 'b1',
        name: 'Bengaluru Fresh Foods',
        email: 'buyer@farmbid.in',
        role: 'buyer',
        walletBalance: 250000,
        did: 'did:farmbid:buyer:0x1a2b3c4d5e6f',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    farmer: {
        id: 'f1',
        name: 'Ramappa Gowda',
        email: 'farmer@farmbid.in',
        role: 'farmer',
        walletBalance: 45000,
        did: 'did:farmbid:farmer:0x7a8b9c0d1e2f',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    admin: {
        id: 'a1',
        name: 'Admin User',
        email: 'admin@farmbid.in',
        role: 'admin',
        walletBalance: 0,
        did: 'did:farmbid:admin:0x3e4f5a6b7c8d',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
};
// ── Auth route handlers ─────────────────────────────────────────────
async function handleAuth(subPath, request) {
    if (subPath === '/auth/demo-login' && request.method === 'POST') {
        const { role } = await request.json();
        const user = demoUsers[role] || demoUsers.buyer;
        return cors(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            token: `demo_token_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()}`,
            user
        }));
    }
    if (subPath === '/auth/login' && request.method === 'POST') {
        const { email, password } = await request.json();
        // Demo: accept any credentials, match by email or default to buyer
        const matched = Object.values(demoUsers).find((u)=>u.email === email) || demoUsers.buyer;
        return cors(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            token: `token_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()}`,
            user: matched
        }));
    }
    if (subPath === '/auth/signup' && request.method === 'POST') {
        const body = await request.json();
        const newUser = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            name: body.name || 'New User',
            email: body.email,
            role: body.userType || 'buyer',
            walletBalance: body.userType === 'farmer' ? 0 : 50000,
            did: `did:farmbid:${body.userType || 'buyer'}:0x${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])().replace(/-/g, '').slice(0, 12)}`,
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        };
        const credential = {
            '@context': [
                'https://www.w3.org/2018/credentials/v1'
            ],
            type: [
                'VerifiableCredential',
                'FarmBidIdentity'
            ],
            issuer: 'did:farmbid:issuer:polygon',
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: newUser.did,
                name: newUser.name,
                role: newUser.role
            }
        };
        return cors(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            token: `token_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()}`,
            user: newUser,
            credential
        }));
    }
    return null; // not an auth route
}
// ── Generic handler (routes everything) ─────────────────────────────
async function handler(request, { params }) {
    const { path = [] } = await params;
    const subPath = `/${path.join('/')}`;
    try {
        // 1. Handle auth routes locally (no backend needed)
        /* Disable local auth mock - forwarding to real backend
    if (subPath.startsWith('/auth')) {
      const authResponse = await handleAuth(subPath, request);
      if (authResponse) return authResponse;
      return cors(NextResponse.json({ error: 'Unknown auth route' }, { status: 404 }));
    }
    */ // 2. Proxy everything else to the backend
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001/api';
        const targetUrl = `${backendUrl}${subPath}`;
        const url = new URL(request.url);
        const queryString = url.search;
        const fetchOptions = {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('authorization') || ''
            }
        };
        // Forward body for methods that have one
        if ([
            'POST',
            'PUT',
            'PATCH'
        ].includes(request.method)) {
            try {
                fetchOptions.body = await request.text();
            } catch  {
            // no body
            }
        }
        const backendRes = await fetch(`${targetUrl}${queryString}`, fetchOptions);
        const data = await backendRes.json();
        return cors(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
            status: backendRes.status
        }));
    } catch (error) {
        console.error('API Proxy Error:', error);
        return cors(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: error.message
        }, {
            status: 500
        }));
    }
}
const GET = handler;
const POST = handler;
const PUT = handler;
const DELETE = handler;
const PATCH = handler;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0n_ss89._.js.map