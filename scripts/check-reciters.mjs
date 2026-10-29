async function checkAlquran() {
  try {
    const res = await fetch('https://api.alquran.cloud/v1/ayah/1/ar.abdulrashidsufi');
    const data = await res.json();
    console.log('Result for ar.abdulrashidsufi:', JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
checkAlquran();
