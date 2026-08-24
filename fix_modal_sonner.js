const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

code = code.replace('import toast from "react-hot-toast";', 'import { toast } from "sonner";');

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
