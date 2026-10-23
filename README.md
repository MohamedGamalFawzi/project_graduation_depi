# Demo App: Jenkins CI/CD → Docker → Kubernetes

## محتوى المشروع
- `app.js`, `app.test.js`, `package.json` : تطبيق Node/Express صغير + اختبارات
- `Dockerfile` : بيلد multi-stage للصورة
- `Jenkinsfile` : Checkout → Test → Build → Push → Deploy
- `k8s/deployment.yaml`, `k8s/service.yaml`, `k8s/hpa.yaml`

## قبل التشغيل
1. غيّر `YOUR_DOCKERHUB_USER` في `Jenkinsfile` و `k8s/deployment.yaml`.
2. في Jenkins اعمل Credentials:
   - `dockerhub-creds` (Username with password)
   - `kubeconfig` (Secret file)
3. الـ agent لازم يكون عليه: Docker و kubectl.
4. الـ HPA محتاج `metrics-server` متسطّب في الكلاستر.
5. اعمل Multibranch Pipeline في Jenkins على الريبو (الـ Deploy بيشتغل على branch `main` بس).
   ولتشغيل البيلد تلقائيًا عند كل push: ضيف Webhook في GitHub على `http://<jenkins>/github-webhook/`.

## تجربة محلية
```bash
npm install && npm test
docker build -t demo-app .
docker run -p 3000:3000 demo-app
```
