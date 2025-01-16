
<script setup lang="ts">
const shortcuts = [
  {
    icon: 'mdi-earth',
    title: 'Networks',
    subtitle: 'Choose Network',
    children: [
      {
        title: 'Mainnet',
        icon: 'mdi-check-circle',
        children: [
          {
            title: 'Crossfi Mainnet',
            to: { name: 'CrossfiMainnet' },
          },
          {
            title: 'Mantra Mainnet',
            to: { name: 'MantraMainnet' },
          },
          // Add other mainnet networks here
        ],
      },
      {
        title: 'Testnet',
        icon: 'mdi-test-tube',
        children: [
          {
            title: 'Crossfi Testnet',
            to: { name: 'crossfi-testnet' },
          },
          // Add other testnet networks here
        ],
      },
    ],
  },
  {
    icon: 'mdi-cog-outline',
    title: 'Settings',
    subtitle: 'Account Settings',
    to: { name: 'pages-account-settings-tab', params: { tab: 'account' } },
  },
  {
    icon: 'mdi-help-circle-outline',
    title: 'Help Center',
    subtitle: 'FAQs & Articles',
    to: { name: 'pages-help-center' },
  },
];
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
