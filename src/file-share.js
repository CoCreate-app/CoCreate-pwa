// https://web.dev/learn/pwa/os-integration/
// Have the user select a file.
const [ handle ] = await window.showOpenFilePicker();
// Get the File object from the handle.
const file = await handle.getFile();
// Get the file content.
// Also available, slice(), stream(), arrayBuffer()
const content = await file.text();

// Make a writable stream from the handle.
const writable = await handle.createWritable();
// Write the contents of the file to the stream.
await writable.write(contents);
// Close the file and write the contents to disk.
await writable.close();