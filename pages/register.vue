<script setup>
import { reactive, ref, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import { lowercaseRule, usernameValidation, usernameLength, mailValidation, minLengthRule, uppercaseRule, digitRule, specialCharRule, displaynameLength } from "@/util/checkRules";
import { useFetch } from "#app";
import {helpers, required} from "@vuelidate/validators";


const form = reactive({
  display_name: "",
  username: "",
  email: "",
  password: "",
  confirm_password: "",
  termsofservice: false,
});

const apiErrors = reactive({
  display_name: null,
  username: null,
  email: null,
  password: [],
  confirm_password: null,
  general: null,
  termsofservice: null,
});

const loading = ref(false);

const rules = computed(() => ({
  display_name: { displaynameLength },
  username: { usernameValidation, usernameLength },
  email: { mailValidation },
  password: { minLengthRule, lowercaseRule, uppercaseRule, digitRule, specialCharRule },
  confirm_password: {
    required: helpers.withMessage("Please confirm your password.", required),
    sameAsPassword: helpers.withMessage("Passwords do not match.", (value) => value === form.password),
  },
  termsofservice: {
    required: helpers.withMessage("You must accept the terms of service.", required),
  },
}));

const v$ = useVuelidate(rules, form);

const handleRegister = async () => {
  v$.value.$touch();
  const isValid = await v$.value.$validate();

  if (!isValid) {
    apiErrors.password = v$.value.password.$errors.map(err => err.$message);
    return;
  }

  Object.keys(apiErrors).forEach(key => (apiErrors[key] = key === "password" ? [] : null));
  loading.value = true;

  try {
    const { data, error } = await useFetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (error.value) {
      const errorData = error.value.data?.data || {};
      const { message, errors } = errorData;
      let hasMappedErrors = false;

      if (message) {
        hasMappedErrors = true;
        apiErrors[message.includes("terms of service") ? "termsofservice" : "general"] = message;
      }

      if (errors) {
        Object.entries(errors).forEach(([key, messages]) => {
          hasMappedErrors = true;
          apiErrors[key] = messages;
        });
      }

      if (!hasMappedErrors) {
        apiErrors.general = "An unknown error occurred.";
      }
    } else {
      console.log("Successfully registered:", data.value);
      Navigator.push("/app");
    }
  } catch {
    apiErrors.general = "Network error, please try again later.";
  } finally {
    loading.value = false;
  }
};



</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl p-6">
      <h2 class="text-2xl font-bold text-center mb-4">Sign Up</h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Display Name -->
        <div class="form-control relative">
          <label class="label">
            <span class="label-text">Display Name (optional)</span>
            <div class="tooltip tooltip-left" data-tip="This is the name that will be displayed on your profile. If you leave it empty, your username will be used instead.">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-help"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </div>
          </label>
          <input
              v-model="form.display_name"
              type="text"
              placeholder="Enter your display name"
              class="input input-bordered w-full"
              :class="{ 'input-error': v$.display_name.$error || apiErrors.display_name }"
          />
          <div v-if="v$.display_name.$error || apiErrors.display_name" class="mt-1">
            <span class="badge badge-error bubble">
              {{ apiErrors.display_name || v$.display_name.$errors[0].$message }}
            </span>
          </div>
        </div>

        <!-- Username -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Username</span>
          </label>
          <input
              v-model="form.username"
              type="text"
              placeholder="Enter your username"
              class="input input-bordered w-full"
              :class="{ 'input-error': v$.username.$error || apiErrors.username }"
          />
          <div v-if="v$.username.$error || apiErrors.username" class="mt-1">
            <span class="badge badge-error bubble">
              {{ apiErrors.username || v$.username.$errors[0].$message }}
            </span>
          </div>
        </div>

        <!-- Email -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input
              v-model="form.email"
              type="email"
              placeholder="Your email"
              class="input input-bordered w-full"
              :class="{ 'input-error': v$.email.$error || apiErrors.email }"
          />
          <div v-if="v$.email.$error || apiErrors.email" class="mt-1">
            <span class="badge badge-error bubble">
              {{ apiErrors.email || v$.email.$errors[0].$message }}
            </span>
          </div>
        </div>

        <!-- Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              @blur="v$.password.$touch()"
              :class="{ 'input-error': v$.password.$error }"
          />
          <div v-if="v$.password.$error" class="mt-1 space-y-1">
            <span v-for="error in v$.password.$errors" :key="error.$message" class="badge badge-error bubble">
              {{ error.$message }}
            </span>
          </div>
        </div>

        <!-- Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Confirm Password</span>
          </label>
          <input
              v-model="form.confirm_password"
              type="password"
              placeholder="••••••••"
              class="input input-bordered w-full"
              @blur="v$.confirm_password.$touch()"
              :class="{ 'input-error': v$.confirm_password.$error || apiErrors.confirm_password }"
          />
          <div v-if="v$.confirm_password.$error || apiErrors.confirm_password" class="mt-1">
            <span class="badge badge-error bubble">
              {{ apiErrors.confirm_password || v$.confirm_password.$errors[0].$message }}
            </span>
          </div>
        </div>


        <!-- Checkbox Terms of Service -->
        <div class="form-control">
          <label class="cursor-pointer label">
            <input
                v-model="form.termsofservice"
                type="checkbox"
                class="checkbox"
                :class="{ 'input-error': v$.termsofservice.$error || apiErrors.termsofservice }"
            />
            <span class="checkbox-mark"></span>
            <span class="label-text">I agree to the <a href="#" class="link">Terms of Service</a></span>
          </label>
          <div v-if="v$.termsofservice.$error || apiErrors.termsofservice" class="mt-1">
            <span class="badge badge-error bubble">
              {{ apiErrors.termsofservice || v$.termsofservice.$errors[0].$message }}
            </span>
          </div>
        </div>

        <button type="button" class="btn btn-primary w-full" :disabled="loading" @click="handleRegister">
          {{ loading ? "Registering..." : "Register" }}
        </button>

        <div v-if="apiErrors.general" class="mt-3">
          <span class="badge badge-error bubble">{{ apiErrors.general }}</span>
        </div>
      </form>
    </div>
  </div>
</template>
