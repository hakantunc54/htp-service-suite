const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// Fix handleCall message
const callRegex = /await addHistoryEntry\(order\.id, "CALL", "Kunde angerufen\."\);/m;
const newCall = `await addHistoryEntry(order.id, "CALL", "?? Ausgehender Anruf (Ergebnis offen)");`;
code = code.replace(callRegex, newCall);

// Fix handleSmsAction clipboard
const smsRegex = /try \{\s*await navigator\.clipboard\.writeText\(content\);\s*toast\.success\("SMS kopiert! Google Messages öffnet sich\.\.\.", \{ duration: 4000 \}\);\s*\/\/ Open Google Messages\s*window\.open\("https:\/\/messages\.google\.com\/web\/", "_blank"\);\s*\/\/ Log History\s*await addHistoryEntry\(order\.id, "SMS", `SMS '\$\{templateName\}' generiert und kopiert\.`\);\s*\/\/ Update Communication Status\s*await updateOrderStatus\(order\.id, order\.status, CommunicationStatus\.SMS_GESENDET\);\s*fetchData\(\); \/\/ Reload history\s*\} catch \(err\) \{\s*console\.error\("Failed to copy", err\);\s*toast\.error\("Fehler beim Kopieren in die Zwischenablage\."\);\s*\}/m;

const newSmsLogic = `try {
      // Create a fallback textarea for HTTP environments since navigator.clipboard is HTTPS only
      const textArea = document.createElement("textarea");
      textArea.value = content;
      
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (!successful) throw new Error('execCommand copy failed');
      } catch (err) {
        console.error('Fallback copy failed', err);
        // If even the fallback fails, try modern API as last resort
        if (navigator.clipboard) await navigator.clipboard.writeText(content);
      } finally {
        document.body.removeChild(textArea);
      }

      toast.success("SMS kopiert! Google Messages öffnet sich...", { duration: 4000 });
      
      // Open Google Messages
      window.open("https://messages.google.com/web/", "_blank");
      
      // Log History
      await addHistoryEntry(order.id, "SMS", \`SMS '\${templateName}' generiert und kopiert.\`);
      
      // Update Communication Status
      await updateOrderStatus(order.id, order.status, CommunicationStatus.SMS_GESENDET);
      fetchData(); // Reload history
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Fehler beim Kopieren in die Zwischenablage.");
    }`;

code = code.replace(smsRegex, newSmsLogic);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Updated handleCall and handleSmsAction in orders/[id]/page.tsx");
