# Migration Guide: Deprecated PostgreSQL MCP Server

## 🚨 **URGENT**: PostgreSQL MCP Server Deprecated

The official `@modelcontextprotocol/server-postgres` has been **deprecated** as of September 2025. Projects using this server must migrate to working alternatives immediately.

## 🔍 **How to Identify if You're Affected**

Check your `.mcp.json` file for:
```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"]  // ❌ DEPRECATED
    }
  }
}
```

Or check for error messages:
```
npm warn deprecated @modelcontextprotocol/server-postgres@0.6.2: 
Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
```

## ✅ **Immediate Migration Steps**

### **Step 1: Choose Your Replacement Server**

**For Most Projects (Recommended):**
```json
{
  "database": {
    "command": "npx", 
    "args": ["-y", "enhanced-postgres-mcp-server"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```

**For Advanced Database Management:**
```json
{
  "postgres-enhanced": {
    "command": "npx",
    "args": ["-y", "@henkey/postgres-mcp-server"], 
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```

**For High-Performance Applications:**
```json
{
  "postgres-fast": {
    "command": "npx",
    "args": ["-y", "postgres-mcp"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```

### **Step 2: Update Global Settings**

Update your `~/.claude/settings.local.json`:
```json
{
  "enabledMcpjsonServers": [
    "database",           // or "postgres-enhanced", "postgres-fast"
    // ... other servers
  ]
}
```

### **Step 3: Test Migration**

```bash
# Check if server is available
/mcp

# Test database connectivity  
/mcp-status database --health-check
```

## 🎯 **Server Comparison for Migration**

| Current Need | Recommended Server | Why |
|--------------|-------------------|-----|
| **Basic PostgreSQL access** | `enhanced-postgres-mcp-server` | Drop-in replacement, read/write support |
| **Database optimization** | `@henkey/postgres-mcp-server` | 18 tools, performance analysis |
| **High-volume queries** | `postgres-mcp` | Fastest, type-safe, multi-database |
| **CRM/Analytics projects** | `enhanced-postgres-mcp-server` | Perfect for audience segmentation |
| **Enterprise applications** | `@henkey/postgres-mcp-server` | Schema management, optimization |

## 🔧 **Project-Specific Migrations**

### **E-commerce/CRM Projects**
```json
{
  "database": {
    "command": "npx",
    "args": ["-y", "enhanced-postgres-mcp-server"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```
**Perfect for**: Customer management, audience segmentation, order analytics

### **High-Performance Applications**
```json
{
  "postgres-fast": {
    "command": "npx", 
    "args": ["-y", "postgres-mcp"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```
**Perfect for**: Real-time analytics, high-volume queries, performance-critical apps

### **Database Administration**
```json
{
  "postgres-enhanced": {
    "command": "npx",
    "args": ["-y", "@henkey/postgres-mcp-server"],
    "env": {
      "DATABASE_URL": "${DATABASE_URL}"
    }
  }
}
```
**Perfect for**: Database optimization, schema management, performance tuning

## 🌐 **Cloud Provider Compatibility**

All replacement servers work with:
- ✅ **Neon** - Serverless PostgreSQL with connection pooling
- ✅ **Supabase** - PostgreSQL with real-time features
- ✅ **AWS RDS** - Managed PostgreSQL instances  
- ✅ **Google Cloud SQL** - PostgreSQL managed service
- ✅ **Azure Database** - PostgreSQL flexible server
- ✅ **DigitalOcean** - Managed PostgreSQL
- ✅ **Local Docker** - Development containers

## 🚀 **Enhanced Features Available**

### **Read/Write Operations**
Unlike the deprecated server which was read-only, new servers support:
- ✅ **INSERT operations** - Test data creation
- ✅ **UPDATE operations** - Data modification testing
- ✅ **DELETE operations** - Cleanup and maintenance
- ✅ **Schema modifications** - Development database changes

### **Performance Analysis**
Advanced servers provide:
- ✅ **EXPLAIN plan analysis** - Query optimization
- ✅ **Index recommendations** - Performance improvements  
- ✅ **Slow query identification** - Bottleneck detection
- ✅ **Connection pool monitoring** - Resource optimization

### **Schema Management**
Enhanced capabilities include:
- ✅ **Table introspection** - Automatic schema discovery
- ✅ **Relationship mapping** - Foreign key analysis
- ✅ **Column analysis** - Data type and constraint details
- ✅ **Migration support** - Schema change assistance

## ⚠️ **Migration Timeline**

**Immediate (September 2025):**
- Replace deprecated server references
- Update project configurations
- Test new server connectivity

**Short-term (October 2025):**
- Optimize server choice based on project needs
- Configure advanced features as needed
- Update team documentation

**Long-term (November 2025+):**
- Leverage enhanced capabilities for development
- Implement performance optimizations
- Explore advanced database management features

## 💡 **Troubleshooting Common Issues**

### **Issue**: Server won't connect
**Solution**: Verify DATABASE_URL format and network connectivity

### **Issue**: Permission errors
**Solution**: Ensure database user has appropriate permissions for read/write operations

### **Issue**: Performance slow
**Solution**: Consider switching to `postgres-mcp` for high-performance needs

### **Issue**: Missing schema information
**Solution**: Use `@henkey/postgres-mcp-server` for comprehensive schema introspection

## 📊 **Verified Use Cases**

**Successfully tested with:**
- ✅ **DreamiHairCare CRM Marketing MVP** - Audience segmentation, automation workflows
- ✅ **E-commerce platforms** - Order management, customer analytics
- ✅ **SaaS applications** - User management, subscription tracking
- ✅ **Analytics platforms** - Data analysis, reporting, visualization

## 🎯 **Recommendations by Project Type**

| Project Type | Primary Server | Secondary Option | Use Case |
|--------------|----------------|------------------|----------|
| **E-commerce** | enhanced-postgres-mcp-server | postgres-mcp | Customer management, orders |
| **Analytics** | postgres-mcp | @henkey/postgres-mcp-server | High-volume queries, reporting |
| **CRM Systems** | enhanced-postgres-mcp-server | @henkey/postgres-mcp-server | Segmentation, automation |
| **Enterprise** | @henkey/postgres-mcp-server | enhanced-postgres-mcp-server | Schema management, optimization |

---

**Document Created**: September 8, 2025  
**Based on**: Real-world testing with DreamiHairCare CRM implementation  
**Verified**: PostgreSQL 14+, Neon serverless, Docker environments  
**Status**: Production ready for immediate use