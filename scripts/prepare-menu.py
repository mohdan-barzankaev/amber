from pathlib import Path
import json,re
text=Path('AMBER-MENU.md').read_text()
sections=re.split(r'^## ',text,flags=re.M)[1:]
food_ids=[['c742cf','c742cc','c62caa','c62ca5','c61200','c611ff','c60fbd','c6093a','c1e1b3','bf2b8e','bf2b8d','bf2b8a'],['c74306','c63c6c','bf2b9d'],['c64af4','c64af3','c628b6','c1e1b6','c1e1b1','bf2b97','bf2b96','bf2b95','bf643d','bf643a','bf2b62','bf2b61'],['c60fbd','bf6436','bf6435','bf2b91','bf2b94','bf2b93','bf2b92','bf2b90'],['c64af2','bf2b9c','bf2b9b','bf2b98'],['c1b48b','c1ab10','bf6430','bf2bb4','bf2b63']]
keys=['mains','desserts','breakfast','pasta','salads','soups','black-coffee','alternative','milk-coffee','raf','iced-coffee','lemonade','fresh','smoothie','tea','iced-tea','not-coffee','signature-tea']
products={}; categories=[]
for idx,section in enumerate(sections[:18]):
    title=section.split('\n',1)[0]; key=keys[idx]; group='food' if idx<6 else 'drinks'
    categories.append({'id':key,'name':title,'group':group})
    rows=re.findall(r'^\| (.*?) \| ([\d /]+) \|$',section,re.M)
    rows += [(name,'300' if idx==11 else '280') for name in re.findall(r'^- (.+)$',section,re.M)]
    for j,(name,price) in enumerate(rows):
        ident=food_ids[idx][j] if idx<6 else key+'-'+str(j+1)
        if ident in products: products[ident]['categories'].append(key); continue
        variants=[]
        if '/' in price:
            prices=[int(p.strip()) for p in price.split('/')]
            volumes=re.search(r'250 / 350 мл',name)
            if volumes: name=name.replace(' 250 / 350 мл','')
            variants=[{'id':str(v),'label':str(v)+' мл','price':p} for v,p in zip([250,350],prices)]
        product={'id':ident,'name':name,'price':int(price.split('/')[0].strip()),'categories':[key],'group':group}
        if variants: product['variants']=variants
        if idx<6: product['image']='/images/'+ident+'.webp'
        products[ident]=product
products['c7bcd4']={'id':'c7bcd4','name':'Салат Хрустящий Баклажан','price':450,'categories':['salads'],'group':'food','image':'/images/c7bcd4.webp'}
# Display the most useful categories first, retain source membership.
order=['breakfast','mains','pasta','salads','soups','desserts']+keys[6:]
categories.sort(key=lambda c:order.index(c['id']))
Path('src/data/menu.json').write_text(json.dumps({'categories':categories,'products':list(products.values())},ensure_ascii=False,indent=2)+'\n')
print(len([p for p in products.values() if p['group']=='food']),'food;',len([p for p in products.values() if p['group']=='drinks']),'drinks')
