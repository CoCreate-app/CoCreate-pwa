
async function getContacts() {
    const properties = ['name', 'email', 'tel'];
    const options = { multiple: true };
    try {
      const contacts = await navigator.contacts.select(properties, options);
      console.log(contacts);
    } catch (ex) {
      // Handle any errors here.
    }
 }