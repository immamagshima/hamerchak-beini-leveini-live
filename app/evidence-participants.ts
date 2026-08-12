export type EvidenceParticipant = {
  name: string;
  oldImage: string;
  newImage: string;
  split?: boolean;
};

const asset = (file: string) => `/identity-evidence/${file}`;
const drive = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w1800`;

export const evidenceParticipants: EvidenceParticipant[] = [
  { name: "נטלי ארנטוף", oldImage: asset("natali_old.jpg"), newImage: asset("natali_new.jpg") },
  { name: "אדווה אביכזר", oldImage: asset("adva_old.jpg"), newImage: asset("adva_new.jpg") },
  { name: "קרן שביב ארבל", oldImage: asset("keren_old.jpg"), newImage: asset("keren_new.jpg") },
  { name: "דנה ולנסקי", oldImage: asset("dana_v_old.jpg"), newImage: asset("dana_v_new.jpg") },
  { name: "רונה גואטה", oldImage: asset("ron_old.jpg"), newImage: asset("ron_new.jpg") },
  { name: "נילי צרפתי", oldImage: asset("nili_old.jpg"), newImage: asset("nili_new.jpg") },
  { name: "ליאור רוזנברג", oldImage: asset("lior_old.jpg"), newImage: asset("lior_new.jpg") },
  { name: "יונית לייבוביץ", oldImage: asset("yonit_old.jpg"), newImage: asset("yonit_new.jpg") },
  { name: "דנה סורין", oldImage: asset("dana_s_old.jpg"), newImage: asset("dana_s_new.jpg") },
  { name: "טל פורטוס", oldImage: asset("tal_old.jpg"), newImage: asset("tal_new.jpg") },
  { name: "תמנע", oldImage: asset("timna_old.jpg"), newImage: asset("timna_new.jpg") },
  { name: "לייה לוצ'יניצר", oldImage: asset("liya_old_upright.jpg"), newImage: asset("liya_new.jpg") },
  { name: "שלי זיו", oldImage: asset("shelly_old.jpg"), newImage: asset("shelly_new.jpg") },
  { name: "רוזנה רוטמן", oldImage: asset("rozana_old.jpg"), newImage: asset("rozana_new.jpg") },
  { name: "אהובה ויינברג", oldImage: asset("ahuva_old.jpg"), newImage: asset("ahuva_new.jpg") },
  { name: "סימה ברקאי קישוו", oldImage: asset("sima_old.jpg"), newImage: asset("sima_new.jpg") },
  { name: "אוריאן כרמון", oldImage: asset("orian_old.png"), newImage: asset("orian_new.png") },
  { name: "נועם עמית", oldImage: asset("noam_old.png"), newImage: asset("noam_new.png") },
  { name: "סבטה נפתולין", oldImage: drive("1Qpp5JsTVKKGwV7vA7DfcOhismFiUuGN7"), newImage: drive("1HW4ae4su_Hsp_dvv4ipVmXmNTGEJ-pK-") },
  { name: "אלין יריחו", oldImage: asset("elin_source.jpg"), newImage: asset("elin_source.jpg"), split: true },
];
