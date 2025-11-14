// Browser console에서 실행할 디버깅 스크립트
console.log('=== Contracts in localStorage ===');
const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
console.log('Number of contracts:', contracts.length);
console.log('Contracts:', contracts);

console.log('\n=== Contract Details in localStorage ===');
const contractDetails = JSON.parse(localStorage.getItem('contractDetails') || '{}');
console.log('Contract Details:', contractDetails);

console.log('\n=== Customers in localStorage ===');
const customers = JSON.parse(localStorage.getItem('customers') || '[]');
console.log('Number of customers:', customers.length);
console.log('Customers:', customers);
