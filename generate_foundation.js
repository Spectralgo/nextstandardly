#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

// Define the components
const COMPONENTS = [
    { name: 'Service Files', key: 'service' },
    { name: 'Model and Broker Files', key: 'model_broker' },
    { name: 'Action Controller', key: 'controller' },
    { name: 'Router File', key: 'router' }
];

program
    .version('1.0.0')
    .description('A CLI tool for generating backend code components')
    .option('-e, --entity <name>', 'Specify the singular entity name')
    .option('-p, --plural <name>', 'Specify the plural entity name')
    .option('-c, --components <items>', 'Specify components to generate (comma-separated)')
    .parse(process.argv);

const options = program.opts();

// Function to read template files
function readTemplate(templateName, templatesDir) {
    const templatePath = path.join(templatesDir, templateName);
    if (!fs.existsSync(templatePath)) {
        console.error(chalk.red(`Error: Template '${templateName}' does not exist in ${templatesDir}`));
        process.exit(1);
    }
    return fs.readFileSync(templatePath, 'utf-8');
}

// Function to replace placeholders in templates
function replacePlaceholders(template, placeholders) {
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, p1) => {
        return placeholders[p1] || match;
    });
}

// Function to write output files
function writeOutputFile(outputPath, content) {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(chalk.green(`✅ Generated file: ${outputPath}`));
}

// Function to generate foundation service files
function generateFoundationService(entityName, entityNamePlural, placeholders, templatesDir, rootDir) {
    const templates = [
        'EntityNameService.Interface.txt',
        'EntityNameService.Validation.txt',
        'EntityNameService.Exceptions.txt',
        'EntityNameService.txt',
    ];

    const outputDir = path.join(rootDir, 'src', 'server', 'services', 'foundations', entityNamePlural.toLowerCase());

    for (const templateName of templates) {
        const templateContent = readTemplate(templateName, templatesDir);
        const outputContent = replacePlaceholders(templateContent, placeholders);
        const outputFileName = templateName.replace('EntityName', entityName).replace('.txt', '.ts');
        const outputPath = path.join(outputDir, outputFileName);
        writeOutputFile(outputPath, outputContent);
    }
}

// Function to generate model and broker files
function generateModelAndBroker(entityName, entityNamePlural, placeholders, templatesDir, rootDir) {
    // Generate model file
    const modelTemplate = readTemplate('ModelTemplate.txt', templatesDir);
    const modelContent = replacePlaceholders(modelTemplate, placeholders);
    const modelOutputPath = path.join(rootDir, 'src', 'server', 'models', `${entityNamePlural}.ts`);
    writeOutputFile(modelOutputPath, modelContent);

    // Generate broker file
    const brokerTemplate = readTemplate('BrokerTemplate.txt', templatesDir);
    const brokerContent = replacePlaceholders(brokerTemplate, placeholders);
    const brokerOutputPath = path.join(rootDir, 'src', 'server', 'brokers', 'storage_broker', `${entityNamePlural}.StorageBroker.ts`);
    writeOutputFile(brokerOutputPath, brokerContent);

    // Generate broker interface file
    const interfaceTemplate = readTemplate('BrokerInterfaceTemplate.txt', templatesDir);
    const interfaceContent = replacePlaceholders(interfaceTemplate, placeholders);
    const interfaceOutputPath = path.join(rootDir, 'src', 'server', 'brokers', 'storage_broker', `${entityNamePlural}.StorageBroker.Interface.ts`);
    writeOutputFile(interfaceOutputPath, interfaceContent);
}

// Function to generate action controller file
function generateActionController(entityName, entityNamePlural, placeholders, templatesDir, rootDir) {
    const templateContent = readTemplate('ActionControllerTemplate.txt', templatesDir);
    const outputContent = replacePlaceholders(templateContent, placeholders);
    const outputDir = path.join(rootDir, 'src', 'server', 'action-controllers');
    const outputFile = path.join(outputDir, `${entityName}.ActionController.ts`);
    writeOutputFile(outputFile, outputContent);
}

// Function to generate router file
function generateRouterFile(entityName, entityNamePlural, placeholders, templatesDir, rootDir) {
    const templateContent = readTemplate('RouterTemplate.txt', templatesDir);
    const outputContent = replacePlaceholders(templateContent, placeholders);
    const routerFileName = `${entityNamesToLower(entityNamePlural)}Router.ts`; // e.g., accountsRouter.ts
    const outputDir = path.join(rootDir, 'src', 'app', 'api', '[[...openapi]]', '_router');
    const outputFile = path.join(outputDir, routerFileName);
    writeOutputFile(outputFile, outputContent);
}

// Helper function to convert entityNames to lowercase
function entityNamesToLower(entityNames) {
    // Convert first character to lowercase
    return entityNames.charAt(0).toLowerCase() + entityNames.slice(1);
}

// Function to prompt for entity names
async function promptForEntityNames() {
    const questions = [
        {
            type: 'input',
            name: 'entityName',
            message: 'Enter the singular name of the entity (e.g., "User"):',
            validate: input => input.trim() !== '' || 'Entity name cannot be empty'
        },
        {
            type: 'input',
            name: 'entityNamePlural',
            message: 'Enter the plural name of the entity (e.g., "Users"):',
            validate: input => input.trim() !== '' || 'Plural name cannot be empty'
        }
    ];

    return inquirer.prompt(questions);
}

// Function to prompt for components
async function promptForComponents() {
    const question = {
        type: 'checkbox',
        name: 'selectedComponents',
        message: 'Select the components you want to generate:',
        choices: COMPONENTS.map(component => ({
            name: component.name,
            value: component.key
        })),
        validate: input => input.length > 0 || 'You must choose at least one component'
    };

    const { selectedComponents } = await inquirer.prompt(question);
    return selectedComponents;
}

// Main function
async function main() {
    const rootDir = process.cwd();
    const userTemplatesDir = path.join(rootDir, 'templates');
    const defaultTemplatesDir = path.join(__dirname, 'templates');

    const templatesDir = fs.existsSync(userTemplatesDir) ? userTemplatesDir : defaultTemplatesDir;

    if (!fs.existsSync(templatesDir)) {
        console.error(chalk.red(`Error: Templates directory '${templatesDir}' does not exist.`));
        process.exit(1);
    }

    let entityName = options.entity;
    let entityNamePlural = options.plural;
    let components = options.components ? options.components.split(',') : [];

    // Prompt for entity names if not provided
    if (!entityName || !entityNamePlural) {
        const entityNames = await promptForEntityNames();
        entityName = entityNames.entityName;
        entityNamePlural = entityNames.entityNamePlural;
    }

    // Prompt for components if not provided
    if (components.length === 0) {
        components = await promptForComponents();
    }

    // Convert to camelCase
    const entityNameCamel = entityName.charAt(0).toLowerCase() + entityName.slice(1);
    const entityNamePluralCamel = entityNamePlural.charAt(0).toLowerCase() + entityNamePlural.slice(1);

    // Define placeholders
    const placeholders = {
        'EntityName': entityName,
        'EntityNames': entityNamePlural,
        'entityName': entityNameCamel,
        'entityNames': entityNamePluralCamel,
    };

    // Generate selected components
    const spinner = ora('Generating components...').start();

    try {
        if (components.includes('service')) {
            await generateFoundationService(entityName, entityNamePlural, placeholders, templatesDir, rootDir);
        }

        if (components.includes('model_broker') || components.includes('model') || components.includes('broker')) {
            await generateModelAndBroker(entityName, entityNamePlural, placeholders, templatesDir, rootDir);
        }

        if (components.includes('controller')) {
            await generateActionController(entityName, entityNamePlural, placeholders, templatesDir, rootDir);
        }

        if (components.includes('router')) {
            await generateRouterFile(entityName, entityNamePlural, placeholders, templatesDir, rootDir);
        }

        spinner.succeed(chalk.green('Components generated successfully!'));
    } catch (error) {
        spinner.fail(chalk.red('Error generating components'));
        console.error(chalk.red(error));
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    console.error(chalk.red('An unexpected error occurred:'));
    console.error(chalk.red(error));
    process.exit(1);
});