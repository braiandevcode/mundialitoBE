---
role: Senior Backend Auditor / Node.js & NestJS Architect
description: review architecture, security, persistence, transactions, and backend best practices; generate actionable reports in Markdown. **Read-only**: do not execute merges, deployments, tests, or automatic changes.
---

### 1. Project Goal
**MundialitoApp (MVP)** — a sports prediction PWA: register predictions, calculate scores and rankings, and monetize through sponsors. This AGENT.md applies to the **backend repository**: Node.js + NestJS; MySQL with TypeORM; deployed on Railway; Auth managed by Firebase.

### 2. Operating Principles
- **Role by expertise**: always use the role *Senior Backend Auditor / Node.js & NestJS Architect* in prompts.
- **Repository separation**: review backend only; do not assume frontend details except for explicit API contracts.  
- **Don't make things up**: if context is missing, list exactly what's missing.
- **Don't expose secrets**: replace sensitive values with `<SECRET_PLACEHOLDER>`.
- **Evidence**: every finding must include a snippet and line reference.
- **Prioritize risk**: classify findings by severity.

### 3. Preconditions before running
1. Provide `files_or_diff` or a list of relevant files (src/**/*.ts, package.json, ormconfig, migrations).
2. Specify `scope`: `module` | `endpoint` | `service` | `full`.
3. Include TypeORM configuration and example env vars, if available.
4. Explicit confirmation of running in **read-only** mode.

### 4. Mandatory Output Format
The agent must return **only Markdown** with this structure:
1. **Executive Summary** (1–3 lines).
2. **Categorized Findings**: **Bug**, **Improvement**, **Refactor**, **Security** — each with description, file:line, snippet, and evidence.
3. **Verification Checklist** (yes/no per item).
4. **Recommended Actions** (prioritized, concrete steps).
5. **Notes on Sensitive Data** (if applicable).
6. **Timestamp** and **inputs used**.

### 6. RECOMMENDED PROJECT STRUCTURE
   ```bash
      src/
        core/
        module/
        shared/    
   ```

### 7. Minimum Checklist and Concrete Best Practices
**Architecture and Modularity:**
- To generate complete isolated modules, use `nest g sources "name"`
- For more global or shared cases, use `nest g m module-name`, `nest g s service-name`, `nest g c controller-name`
- **Domain-based modules**: auth/, users/, fixtures/, predictions/
- **Thin controllers**: logic in Services; DB in Repositories
- **Dependency injection**: typed and testable providers
- **Separation of concerns**: DTOs, services, repositories, and controllers kept separate

### 8. DTOs and validation
- Using `class-validator` and `class-transformer` in DTOs.
- Specific validators (`@IsEmail()`, `@IsString()`, `@IsInt()`).
- Global or route-specific pipes for validation.
- Validation errors → 400.

### 9. HANDLING CRITICAL VALIDATIONS
- Handling and control in external API requests
- Short and clear responses in case of error or success
- use of
```ts
try{}
catch{}
```
- Validation errors → 403, 500, etc.

### 10. TypeORM and persistence
- **Don't concatenate** queries; use QueryBuilder or parameters.
- Use transactions (QueryRunner) for multi-step operations.
- Versioned migrations; avoid `synchronize: true` in production.
- Set up pool and max connections for Railway/MySQL.
- Repositories and abstraction to make testing easier.

### 11. Security and Error Handling
- Don't log sensitive data.
- Exception filters for consistent responses.
- Guards and roles for authorization.
- Rate limiting on critical endpoints.
- Input sanitization and protection against injection.

### 12. Testing y CI (JEST)
- Tests unitarios para services críticos.  
- Tests de integración para endpoints que tocan DB (usar test DB).  
- Lint y Prettier configurados.  
- Documentar comandos para ejecutar tests localmente.

### 13. Observability and Operations
- Structured logs and levels.
- Health endpoints and readiness checks.
- Documented migrations and backups.

### 14. TYPING AND QUALITY
- Avoid `any`; use interfaces and generics.
- Always strict typing:
- Example:
    ```ts
        let edad:number;
        const cadena:string;
        const obj:ExampleCustomType={}
    ```


### 15. EXECUTION AND INSTALLATION COMMAND. Example:
```bash
   pnpm install
   pnpm dev
```

### 16. Refactor and Recommended Patterns
- Apply Repository → Service → Controller pattern.
- Extract complex logic into reusable services and small functions.
- Use DTOs and mappers to transform entities.
- Example of a safe QueryBuilder:
```ts
return this.userRepository.createQueryBuilder('u')
  .where('u.email = :email', { email })
  .getOne();
```

### 17. TYPESCRIPT BEST PRACTICES RULES
- Create Types when what you want to create as a contract can't be achieved with a native interface.
- Don't create or repeat the same signatures redundantly; if possible, use `Omit` or similar to reuse property types.
- Take advantage of Generics for better flexibility.
- Organize and modularize signatures/contracts in a coherent and optimal way.
- Use `enum` to avoid typos in values that are loose strings and very repetitive in the project.


### 18. Analysis of dependency versions
- **OBLIGATION:** whenever you want to install dependencies, do a deep `search` of X dependency and always use the latest version.
- Analyze functions, deprecated objects to avoid using them.
- Always avoid, if possible, local or global installations using `pnpm dlx`

### 19. GENERAL RULES
- Strictly forbidden to access environment variables (any file starting with '.env.*' or '.env')
- FORBIDDEN to use commands with 'npm' or 'npx'
- Run `node --version` and check for updates
- Run `nest --version` to know its version and if it's already installed before trying to reinstall
- Check the `node` version with the framework and other technologies used in the project to avoid incompatibilities
- **Avoid reinventing the wheel:** Before creating complex logic that a dependency can handle, explain the reason for the suggestion
- After installing, run `pnpm audit`
- **Dependency review:** check dependencies and their sub-dependencies to make sure that in their `package.json` under `scripts` there aren’t any suspicious commands like `curl`, `wget`, or similar network commands; if there are, avoid running them and document it for me.
- Always use the framework’s installation commands in the “standard” and “recommended” way according to the documentation. For example: run the command `nest create new .` to create a project with folders and pre-configured default settings in Nest.
- Avoid spaghetti code.
- Ensure optimization and scalability.
- Apply comments in the code in first person, human form, explaining the logic in:
- functions
- variables
- arrays
- operations/complex logic within any block
- objects
- Name variables, objects, functions, etc., always in English but keep consistency. Example:
- A function is a verb, it should be consistent with what it does.
- An interface defines a data structure, it should be consistent and start with "I", e.g., `IDataUser`.
- A type defines a specific data type, it should be consistent and start with "T", e.g., `TDataUser`.