# Bundling extra files

If you want to add a file to the ZIP bundle, you can use `includeFiles`:

```json
{
  "includeFiles": {
    ".": ["file.txt"],
    "assets": ["assets/**/*"],
    "pages": ["pages/*.html"]
  }
}
```

The `includeFiles` keys represent the folders the files will be extracted to (with "." being the function root folder `/var/task`). The array contains glob patterns of files that will be included.
