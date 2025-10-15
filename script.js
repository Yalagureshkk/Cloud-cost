const $ = id => document.getElementById(id)

const providerRatesINR = {
  aws: { price_vcpu: 3.72, price_storage: 6.65, price_bandwidth: 7.47 },
  azure: { price_vcpu: 4.15, price_storage: 7.90, price_bandwidth: 7.20 },
  gcp: { price_vcpu: 3.90, price_storage: 7.30, price_bandwidth: 7.00 }
}

function applyProvider(p){
  if(p in providerRatesINR){
    $('price_vcpu').value = providerRatesINR[p].price_vcpu
    $('price_storage').value = providerRatesINR[p].price_storage
    $('price_bandwidth').value = providerRatesINR[p].price_bandwidth
  }
}

$('provider').addEventListener('change', e => applyProvider(e.target.value))

function calculateLocal(){
  const instances = Number($('instances').value) || 0
  const vcpu = Number($('vcpu').value) || 0
  const hours = Number($('hours').value) || 0
  const price_vcpu = Number($('price_vcpu').value) || 0
  const storage = Number($('storage').value) || 0
  const price_storage = Number($('price_storage').value) || 0
  const bandwidth = Number($('bandwidth').value) || 0
  const price_bandwidth = Number($('price_bandwidth').value) || 0

  const computeCost = instances * vcpu * hours * price_vcpu
  const storageCost = storage * price_storage
  const bandwidthCost = bandwidth * price_bandwidth
  const total = computeCost + storageCost + bandwidthCost
  const yearly = total * 12

  return { computeCost, storageCost, bandwidthCost, total, yearly }
}

function formatINR(x){
  return '₹' + Number(x).toLocaleString('en-IN', {maximumFractionDigits:2})
}

function showResult(res){
  $('computeVal').innerText = formatINR(res.computeCost)
  $('storageVal').innerText = formatINR(res.storageCost)
  $('bandwidthVal').innerText = formatINR(res.bandwidthCost)

  // ✅ Updated: Always display totals in INR (no $ symbol)
  $('totalVal').innerText = 'Monthly Total: ' + formatINR(res.total)
  $('yearlyVal').innerText = 'Yearly Total: ' + formatINR(res.yearly)

  $('result').hidden = false
}


$('calc').addEventListener('click', ()=>{
  const res = calculateLocal()
  showResult(res)
})

$('download').addEventListener('click', ()=>{
  const data = calculateLocal()
  const row = {
    provider: $('provider').value,
    instances: $('instances').value,
    vcpu: $('vcpu').value,
    hours: $('hours').value,
    price_vcpu: $('price_vcpu').value,
    storage: $('storage').value,
    price_storage: $('price_storage').value,
    bandwidth: $('bandwidth').value,
    price_bandwidth: $('price_bandwidth').value,
    computeCost: data.computeCost.toFixed(2),
    storageCost: data.storageCost.toFixed(2),
    bandwidthCost: data.bandwidthCost.toFixed(2),
    total: data.total.toFixed(2)
  }
  const headers = Object.keys(row)
  const csv = headers.join(',') + '\n' + headers.map(h => row[h]).join(',')
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'CloudRCalci_estimate.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
})

// initialize provider to AWS rates
applyProvider('aws')
