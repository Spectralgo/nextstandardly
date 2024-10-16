# NextStandardly

NextStandardly is a CLI tool for quickly generating backend code components for Next.js projects. Generate services, models, brokers, controllers, and routers with ease.

## Quick Start

Use NextStandardly directly with npx (no installation required):

```bash
npx nextstandardly
```

## Usage

Basic command:

```bash
npx nextstandardly [options]
```

Options:

-   `-e, --entity <name>`: Singular entity name
-   `-p, --plural <name>`: Plural entity name
-   `-c, --components <items>`: Components to generate (comma-separated)

Example:

```bash
npx nextstandardly -e User -p Users -c service,controller
```

If you run the command without options, NextStandardly will guide you through an interactive prompt.

## Available Components

-   `service`: Service Files
-   `model_broker`: Model and Broker Files
-   `controller`: Action Controller
-   `router`: Router File

## Examples

1. Generate all components for a 'User' entity with prompts:

    ```bash
    npx nextstandardly
    ```

2. Generate all components for a 'Product' entity without prompts:

    ```bash
    npx nextstandardly -e Product -p Products
    ```

3. Generate only service and controller for an 'Order' entity:
    ```bash
    npx nextstandardly -e Order -p Orders -c service,controller
    ```

## Template Customization

To customize templates, create a `templates` directory in your project root with the following structure:

```
templates/
├── EntityNameService.Interface.txt
├── EntityNameService.Validation.txt
├── EntityNameService.Exceptions.txt
├── EntityNameService.txt
├── ModelTemplate.txt
├── BrokerTemplate.txt
├── BrokerInterfaceTemplate.txt
├── ActionControllerTemplate.txt
└── RouterTemplate.txt
```

NextStandardly will use these templates instead of the default ones if present.

## Contributing

Contributions are welcome! Please submit a Pull Request on our GitHub repository.

## License

MIT License. See [LICENSE](LICENSE) file for details.

## Support

For issues or questions, please open an issue on our GitHub repository.

---

Happy coding with NextStandardly! 🚀
