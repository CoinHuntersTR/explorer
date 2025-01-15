
<template>
  <footer class="flex items-center justify-between h-12 mt-5 text-sm bg-gray-100 dark:bg-[#171d30] py-2 px-4 z-10 w-full">
    <div class="flex items-center">
      &copy;&nbsp;{{ new Date().getFullYear() }}&nbsp;
      Made With&nbsp;
      <img src="../../assets/images/heart.svg" alt="heart" class="mx-1" />&nbsp;
      By&nbsp;
      <a class="link link-primary no-underline" href="https://ping.pub" target="_blank" rel="noopener noreferrer">
        Ping.pub
      </a>
    </div>
    
    <div class="flex items-center space-x-4">
      <a href="https://coinhunters.org" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
        <i class="fas fa-globe text-xl"></i>
      </a>
      <a href="https://nodes.coinhunters.org" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
        <i class="fas fa-server text-xl"></i>
      </a>
      <a href="https://twitter.com/CoinHuntersTR" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
        <i class="fab fa-twitter text-xl"></i>
      </a>
      <a href="https://t.me/CoinHuntersTR" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
        <i class="fab fa-telegram text-xl"></i>
      </a>
      <a href="https://youtube.com/@CoinHunterstr" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
        <i class="fab fa-youtube text-xl"></i>
      </a>
    </div>
  </footer>
</template>
