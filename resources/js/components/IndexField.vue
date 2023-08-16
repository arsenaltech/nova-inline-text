<template>
  <div>
    <div v-if="field.editableField" class="inline-flex items-center w-full">
      <input
          :id="fieldId"
          type="text"
          class="w-full form-control form-input form-input-bordered mr-3"
          :class="errorClasses"
          :placeholder="field.name"
          v-model="value"
          v-on="listener"
          :disabled="field.readonly"
      />
      <span @click="field.editableField = false"
            class="inline-flex cursor-pointer text-danger has-tooltip">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                   class="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                         d="M6 18L18 6M6 6l12 12"></path></svg>
          </span>
    </div>
    <div v-else class="inline-flex items-center">
      <span class="whitespace-no-wrap mr-3">{{ field.value }}</span>
      <span v-if="field.inlineOnIndex && field.editableField == false" @click="field.editableField = true" class="inline-flex cursor-pointer text-70 hover:text-primary mr-3 has-tooltip">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-labelledby="edit" role="presentation" class="fill-current"><path d="M4.3 10.3l10-10a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-.7.3H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 .3-.7zM6 14h2.59l9-9L15 2.41l-9 9V14zm10-2a1 1 0 0 1 2 0v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h6a1 1 0 1 1 0 2H2v14h14v-6z"></path></svg>
          </span>
    </div>
  </div>
</template>

<script>
import { FormField, HandlesValidationErrors } from 'laravel-nova';

export default {
  mixins: [FormField, HandlesValidationErrors],

  props: ['resourceName', 'field'],
  methods: {
    submit() {
      if (this.valueWasNotChanged){
        this.field.editableField = false;
        return;
      }

      let formData = new FormData();

      formData.append(this.field.attribute, this.value);
      formData.append("inline-edit", true);
      formData.append('_method', 'PUT');

      return Nova.request()
          .post(
              `/nova-api/${this.resourceName}/${this.$parent.resource.id.value}`,
              formData
          )
          .then(
              (response) => {
                this.$toasted.show(`${this.field.name} updated`, {
                  type: 'success',
                });
                if(response.data != undefined){
                  this.refreshTable(response.data);
                }else{
                  this.$toasted.show(`Please refresh the page`, {
                    type: 'success',
                  });
                }
                this.field.editableField = false;
              },
              (response) => this.$toasted.show(response, { type: 'error' })
          );
    },

    refreshTable(data) {
      if (this.shouldRefresh && data.resource != undefined) {
        this.value = data.resource.template_name || this.value;
        this.field.value = this.value;
      }
    },

    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.substr(1);
    },
  },

  computed: {
    resourceId() {
      return this.$parent.resource.id.value;
    },

    fieldId() {
      return `inline-text-field-${this.field.name}-${this.resourceId}`;
    },

    shouldRefresh() {
      return this.field.refreshOnSaving;
    },

    listener() {
      const event = this.field.event.split('.');
      const name = event[0];
      const modifier = event[1] ? this.capitalize(event[1]) : null;

      return {
        [name]: (e) => {

          if (modifier && modifier === e.key) this.submit();

          if (!modifier) this.submit();
        },
      };
    },

    valueWasNotChanged() {
      return this.value === this.field.value;
    },
  },
};
</script>
