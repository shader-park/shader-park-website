
export const handelUnsavedChanges = (next, self)=> {
    if (Object.keys(self.$store.getters.unsavedChanges).length !== 0) {
        self.$modal.show('dialog', {
            title: 'Unsaved Changes',
            text: 'Are you sure you want to leave and discard changes?',
            buttons: [
                {
                    title: 'Leave & Discard Changes',       // Button title
                    handler: () => {
                        self.$store.commit('resetUnsavedChanges');
                        next();
                        self.$modal.hide('dialog')
                    }
                },
                {
                    title: 'Cancel',
                    default: true,
                    handler: () => self.$modal.hide('dialog')
                }]
        })
    } else {
        next();
    }
}